import argparse
import os

import aiohttp

from pipecat.transports.services.helpers.daily_rest import DailyRESTHelper
from dotenv import load_dotenv

load_dotenv()


async def configure(aiohttp_session: aiohttp.ClientSession):
    """Configure the Daily room and Daily REST helper."""
    parser = argparse.ArgumentParser(description="Daily AI SDK Bot Sample")
    parser.add_argument(
        "-u", "--url", type=str, required=False, help="URL of the Daily room to join"
    )
    parser.add_argument(
        "-k",
        "--apikey",
        type=str,
        required=False,
        help="Daily API Key (needed to create an owner token for the room)",
    )
    parser.add_argument(
        "-p",
        "--prompt",
        type=str,
        required=False,
        help="Custom system prompt for practice conversations",
    )

    args, unknown = parser.parse_known_args()

    url = args.url or None
    key = args.apikey or os.getenv("DAILY_API_KEY")
    custom_prompt = args.prompt or None


    daily_rest_helper = DailyRESTHelper(
        daily_api_key=key,
        daily_api_url="https://api.daily.co/v1",
        aiohttp_session=aiohttp_session,
    )

    expiry_time: float = 60 * 60

    token = await daily_rest_helper.get_token(url, expiry_time)

    return (url, token, custom_prompt)
