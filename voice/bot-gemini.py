"""
Gemini Bot Implementation.

This module implements a chatbot using Google's Gemini Multimodal Live model.
It includes:
- Real-time audio interaction
- Speech-to-speech using the Gemini Multimodal Live API
- Transcription using Gemini's generate_content API
- RTVI client/server events
"""

import asyncio
from datetime import date
import sys
import os

import aiohttp
from requests import get
from loguru import logger
from runner import configure

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import Frame, EndFrame, TranscriptionFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frameworks.rtvi import (
    RTVIBotTranscriptionProcessor,
    RTVIMetricsProcessor,
    RTVISpeakingProcessor,
    RTVIUserTranscriptionProcessor,
)
from pipecat.services.gemini_multimodal_live.gemini import GeminiMultimodalLiveLLMService
from pipecat.transports.services.daily import DailyParams, DailyTransport
from dotenv import load_dotenv

logger.remove(0)
logger.add(sys.stderr, level="DEBUG")
load_dotenv()

class UserTranscriptionFrameFilter(FrameProcessor):
    """Filter out UserTranscription frames."""

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, TranscriptionFrame) and frame.user_id == "user":
            return

        await self.push_frame(frame, direction)


async def main():
    """Main bot execution function.

    Sets up and runs the bot pipeline including:
    - Daily video transport with specific audio parameters
    - Gemini Live multimodal model integration
    - Voice activity detection
    - Animation processing
    - RTVI event handling
    """
    async with aiohttp.ClientSession() as session:
        (room_url, token, custom_prompt) = await configure(session)
        
        # Default system instruction for practice conversations
        SYSTEM_INSTRUCTION = f"""
        You are a practice conversation partner helping someone prepare for difficult conversations.
        
        CORE PRINCIPLES:
        - Stay fully in character as the assigned persona with their specific traits
        - Respond authentically - show real emotions, concerns, and reactions this person would have
        - Don't make it artificially easy - provide realistic challenges the user needs to navigate
        - Keep responses natural and conversational (2-3 sentences typically)
        - Listen to how the user communicates and respond accordingly
        - If they communicate well, acknowledge it naturally as the character would
        - If they're defensive or unclear, react as the character would
        - Allow the conversation to reach a natural conclusion
        - Use tools to track conversation quality and provide feedback
        
        Your output will be converted to audio so use natural, conversational language.
        Today is {date.today().strftime("%A, %B %d, %Y")}.
        """

        # Set up Daily transport with specific audio/video parameters for Gemini
        transport = DailyTransport(
            room_url,
            token,
            "Chatbot",
            DailyParams(
                audio_in_sample_rate=16000,
                audio_out_sample_rate=24000,
                audio_out_enabled=True,
                camera_out_enabled=True,
                camera_out_width=1024,
                camera_out_height=576,
                vad_enabled=True,
                vad_audio_passthrough=True,
                vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
            ),
        )

        # Tools for practice conversation tracking and feedback
        tools = [
            {
                "function_declarations": [
                    {
                        "name": "track_communication_quality",
                        "description": "Track the quality of user's communication approach during practice",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "tone": {"type": "string", "description": "User's tone: calm, defensive, aggressive, empathetic, unclear"},
                                "clarity": {"type": "number", "description": "Message clarity score 1-10"},
                                "empathy_shown": {"type": "boolean", "description": "Whether user showed empathy"},
                                "listening_quality": {"type": "number", "description": "How well user listened 1-10"},
                            },
                        }
                    },
                    {
                        "name": "log_conversation_milestone",
                        "description": "Log important moments in the practice conversation",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "milestone_type": {"type": "string", "description": "Type: breakthrough, conflict, resolution, deflection, avoidance"},
                                "description": {"type": "string", "description": "What happened"},
                                "user_response_quality": {"type": "string", "description": "good, needs_improvement, excellent"},
                            },
                            "required": ["milestone_type"],
                        }
                    },
                    {
                        "name": "assess_goal_progress",
                        "description": "Assess progress toward user's stated conversation goal",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "goal_alignment": {"type": "number", "description": "How aligned with goal 1-10"},
                                "progress_notes": {"type": "string", "description": "Notes on progress"},
                                "obstacles_encountered": {"type": "string", "description": "Challenges faced"},
                            },
                        }
                    },
                    {
                        "name": "detect_emotional_state",
                        "description": "Detect and log emotional states during conversation",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_emotion": {"type": "string", "description": "Detected emotion: anxious, confident, frustrated, calm, defensive"},
                                "persona_emotion": {"type": "string", "description": "Character's emotional response"},
                                "emotional_shift": {"type": "boolean", "description": "Whether emotions shifted"},
                            },
                        }
                    },
                    {
                        "name": "suggest_conversation_technique",
                        "description": "Internally note when user could benefit from specific technique",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "technique": {"type": "string", "description": "Technique: active_listening, i_statements, validation, boundary_setting, pause_and_breathe"},
                                "situation": {"type": "string", "description": "When this would help"},
                                "priority": {"type": "string", "description": "low, medium, high"},
                            },
                        }
                    },
                    {
                        "name": "evaluate_conversation_ending",
                        "description": "Evaluate if conversation reached natural conclusion",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "ending_quality": {"type": "string", "description": "positive, neutral, negative, unresolved"},
                                "goal_achieved": {"type": "boolean", "description": "Whether user achieved their goal"},
                                "relationship_impact": {"type": "string", "description": "strengthened, maintained, weakened"},
                                "key_takeaways": {"type": "string", "description": "Main lessons from practice"},
                            },
                        }
                    },
                    {
                        "name": "generate_feedback_summary",
                        "description": "Generate comprehensive feedback at conversation end",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "strengths": {"type": "string", "description": "What user did well"},
                                "areas_for_improvement": {"type": "string", "description": "What to work on"},
                                "specific_examples": {"type": "string", "description": "Concrete examples from conversation"},
                                "recommended_practice": {"type": "string", "description": "What to practice next"},
                                "overall_score": {"type": "number", "description": "Overall performance 1-10"},
                            },
                        }
                    },
                ]
            }
        ]

        # Use custom prompt if provided, otherwise use default practice prompt
        final_system_instruction = custom_prompt if custom_prompt else SYSTEM_INSTRUCTION
        
        # Initialize the Gemini Multimodal Live model
        llm = GeminiMultimodalLiveLLMService(
            api_key=os.getenv('GEMINI_API_KEY'),
            voice_id="Kore",  # Options: Aoede, Charon, Fenrir, Kore, Puck
            transcribe_user_audio=True,
            transcribe_model_audio=True,
            system_instruction=final_system_instruction,
            tools=tools,
        )

        # Register practice conversation tracking functions
        from practice_tools import (
            track_communication_quality,
            log_conversation_milestone,
            assess_goal_progress,
            detect_emotional_state,
            suggest_conversation_technique,
            evaluate_conversation_ending,
            generate_feedback_summary
        )
        
        llm.register_function("track_communication_quality", track_communication_quality)
        llm.register_function("log_conversation_milestone", log_conversation_milestone)
        llm.register_function("assess_goal_progress", assess_goal_progress)
        llm.register_function("detect_emotional_state", detect_emotional_state)
        llm.register_function("suggest_conversation_technique", suggest_conversation_technique)
        llm.register_function("evaluate_conversation_ending", evaluate_conversation_ending)
        llm.register_function("generate_feedback_summary", generate_feedback_summary)

        # Initial message for practice conversation
        messages = [
            {"role": "system", "content": final_system_instruction},
            {"role": "user", "content": "Start the conversation naturally as this person would. Be authentic to their character."},
        ]

        # Set up conversation context and management
        context = OpenAILLMContext(messages, tools=tools)
        context_aggregator = llm.create_context_aggregator(context)

        # RTVI events for Pipecat client UI
        rtvi_speaking = RTVISpeakingProcessor()
        rtvi_user_transcription = RTVIUserTranscriptionProcessor()
        rtvi_bot_transcription = RTVIBotTranscriptionProcessor()
        rtvi_metrics = RTVIMetricsProcessor()

        pipeline = Pipeline(
            [
                transport.input(),
                context_aggregator.user(),
                llm,
                rtvi_speaking,
                rtvi_user_transcription,
                UserTranscriptionFrameFilter(),
                rtvi_bot_transcription,
                rtvi_metrics,
                transport.output(),
                context_aggregator.assistant(),
            ]
        )

        task = PipelineTask(
            pipeline,
            PipelineParams(
                allow_interruptions=True,
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
        )

        @transport.event_handler("on_first_participant_joined")
        async def on_first_participant_joined(transport, participant):
            await transport.capture_participant_transcription(participant["id"])
            await task.queue_frames([context_aggregator.user().get_context_frame()])

        @transport.event_handler("on_participant_left")
        async def on_participant_left(transport, participant, reason):
            print(f"Participant left: {participant}")
            await task.queue_frame(EndFrame())

        runner = PipelineRunner()

        await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
