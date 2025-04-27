from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
fee_wallet = generate_faucet_wallet(client, debug=True)
print(f"Fee Wallet Address: {fee_wallet.classic_address}")
print(f"Fee Wallet Seed: {fee_wallet.seed}")
print(f"Funded with 10,000 testnet XRP")
