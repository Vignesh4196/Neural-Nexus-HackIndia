from flask import Flask, render_template, request
import google.generativeai as genai

app = Flask(__name__)

# Configure API key
genai.configure(api_key="AIzaSyDT71UDF4DkT7I6DsJuatXF351mCHmYMcU")  # Replace with your actual API key

def chat_with_gemini(prompt):
    try:
        # Use the correct model (check with list_models() if needed)
        model = genai.GenerativeModel("gemini-1.5-pro")
        
        # Generate response
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

@app.route("/", methods=["GET", "POST"])
def index():
    response = ""
    if request.method == "POST":
        user_input = request.form["user_input"]
        response = chat_with_gemini(user_input)
    
    return render_template("index.html", response=response)

if __name__ == "__main__":
    app.run(debug=True)
