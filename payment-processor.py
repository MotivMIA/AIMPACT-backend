import stripe
import requests
import os
from dotenv import load_dotenv
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
TRANSAK_API_KEY = os.getenv("TRANSAK_API_KEY")
ISSUER_SEED = os.getenv("ISSUER_SEED")
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

def process_payment(amount_usd, customer_email, user_wallet):
    """Process USD payment and send MNX Coin for presale."""
    try:
        # Validate USD amount
        if amount_usd < 10:
            raise ValueError("Minimum purchase is $10")
        
        # Charge card via Stripe
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount_usd * 100),  # Convert to cents
            currency="usd",
            payment_method_types=["card"],
            description="MNX Coin Presale",
            receipt_email=customer_email
        )

        # Convert USD to MNX (presale price: $0.01/MNX)
        mnx_amount = amount_usd / 0.01  # e.g., $10 = 1,000 MNX

        # Send MNX Coin via XRPL
        issuer_wallet = Wallet.from_seed(ISSUER_SEED)
        payment = Payment(
            account=issuer_wallet.classic_address,
            destination=user_wallet,
            amount={"currency": "MNX", "value": str(mnx_amount), "issuer": issuer_wallet.classic_address}
        )
        response = submit_and_wait(payment, client, issuer_wallet)

        # Calculate fee (2%) and reward (10%)
        fee_mnx = mnx_amount * 0.02
        net_mnx = mnx_amount - fee_mnx
        reward_mnx = net_mnx * 0.10
        reward_usd = reward_mnx * 0.01

        return {
            "status": "success",
            "usd_amount": amount_usd,
            "mnx_amount": net_mnx,
            "reward_usd": reward_usd
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}