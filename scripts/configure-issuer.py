from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import AccountSet
from xrpl.models import AccountSetFlag
from xrpl.transaction import submit_and_wait

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
issuer_seed = "sEd7ahMHwHhigKGDaVStMs6eoL86i4z"  # Replace with seed from create-issuer-wallet.py
issuer_wallet = Wallet.from_seed(issuer_seed)

account_set = AccountSet(
    account=issuer_wallet.classic_address,
    set_flag=8
)
response = submit_and_wait(account_set, client, issuer_wallet)
print(f"Issuer Configured: {response.result}")
