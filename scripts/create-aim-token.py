from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.models.transactions import AccountSet, Payment
from xrpl.transaction import submit_and_wait

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
issuer_wallet = generate_faucet_wallet(client, debug=True)
print(f"Issuer Address: {issuer_wallet.classic_address}")

account_set = AccountSet(
    account=issuer_wallet.classic_address,
    set_flag=AccountSet.ASF_DEFAULT_RIPPLE
)
response = submit_and_wait(account_set, client, issuer_wallet)
print(f"Issuer Configured: {response.result}")

user_address = "USER_WALLET_ADDRESS"
payment = Payment(
    account=issuer_wallet.classic_address,
    destination=user_address,
    amount={
        "currency": "MNX",
        "value": "1000000000",
        "issuer": issuer_wallet.classic_address
    }
)
response = submit_and_wait(payment, client, issuer_wallet)
print(f"Issued 1,000,000,000 MNX to {user_adfrom xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.models.transactions import AccountSet, Payment
from xrpl.transaction import submit_and_wait

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
issuer_wallet = generate_faucet_wallet(client, debug=True)
print(f"Issuer Address: {issuer_wallet.classic_address}")

account_set = AccountSet(
    account=issuer_wallet.classic_address,
    set_flag=AccountSet.ASF_DEFAULT_RIPPLE
)
response = submit_and_wait(account_set, client, issuer_wallet)
print(f"Issuer Configured: {response.result}")

user_address = "USER_WALLET_ADDRESS"
payment = Payment(
    account=issuer_wallet.classic_address,
    destination=user_address,
    amount={
        "currency": "MNX",
        "value": "1000000000",
        "issuer": issuer_wallet.classic_address
    }
)
response = submit_and_wait(payment, client, issuer_wallet)
print(f"Issued 1,000,000,000 MNX to {user_address}")
