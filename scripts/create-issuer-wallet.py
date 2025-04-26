from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

# Connect to XRPL testnet
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

# Generate issuer wallet
issuer_wallet = generate_faucet_wallet(client, debug=True)
print(f"Issuer Address: {issuer_wallet.classic_address}")
print(f"Issuer Seed: {issuer_wallet.seed}")
print(f"Funded with 10,000 testnet XRP")
