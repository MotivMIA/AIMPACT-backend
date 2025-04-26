from flask import Flask, request, jsonify
from payment_processor import process_payment

app = Flask(__name__)

@app.route('/api/pay', methods=['POST'])
def pay():
    data = request.json
    amount_usd = data.get('amount_usd')
    email = data.get('email')
    if not amount_usd or not email:
        return jsonify({"status": "error", "message": "Missing amount or email"}), 400
    
    result = process_payment(amount_usd, email)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)