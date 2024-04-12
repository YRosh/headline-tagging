from flask import Flask, request, jsonify
import mysql.connector
from sentence_transformers import SentenceTransformer
import re
import pickle
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])


db_config = {
    'host': 'localhost', # ADD YOUR HOST URL
    'user': 'root', # ADD YOUR DB USERNAME
    'password': 'PASSWORD', # ADD YOUR DB PASSWORD
    'database': 'DATABASE_NAME' # ADD YOUR DATABASE NAME WHERE YOU WANT THE DATA TO BE STORED
}

# variables to store the table names
MYSQL_DATABASE_USER_INPUTS_TABLE = 'user_interactions'
MYSQL_DATABASE_USER_FEEDBACK_TABLE = 'user_feedback'

# BERT model which is used to convert the given sentence to word embeddings
bert_model = SentenceTransformer('bert-base-nli-mean-tokens')

# function to clean the text with only alpha-numeric characters and space and '.'
def text_clean(text):
  text = re.sub(r'[^A-Za-z0-9 .]+', '', text)
  return text

# initial function to create the necessary tables in the database if not already present
def initialize_database():
    try:
        # Connecting to SQL server
        conn = mysql.connector.connect(**db_config)

        # Create a cursor object
        cursor = conn.cursor()

        # Check if the user inputs table exists
        cursor.execute("SHOW TABLES LIKE '{}'".format(MYSQL_DATABASE_USER_INPUTS_TABLE))
        user_interactions_exists = cursor.fetchone()

        if not user_interactions_exists:
            # Create the user interactions table if it doesn't exist
            query = """
                CREATE TABLE {} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_input VARCHAR(255),
                    model_response VARCHAR(20),
                    probabilities JSON
                )
            """.format(MYSQL_DATABASE_USER_INPUTS_TABLE)
            cursor.execute(query)
        
        # Check if the user feedback table exists
        cursor.execute("SHOW TABLES LIKE '{}'".format(MYSQL_DATABASE_USER_FEEDBACK_TABLE))
        user_feedback_exists = cursor.fetchone()

        if not user_feedback_exists:
            # Create the user feedbacks table if it doesn't exist
            query = """
                CREATE TABLE {} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    feedback VARCHAR(1000)
                )
            """.format(MYSQL_DATABASE_USER_FEEDBACK_TABLE)
            cursor.execute(query)

        # Commit changes and close cursor and connection
        conn.commit()
        cursor.close()
        conn.close()
    
    except Exception as e:
        print("Error: \n", e)

# function to save the user interaction to the DB with user input and model prediction
def save_to_database(headline, probabilities, classes):
    # connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # convert the data to the format required for table
    probabilities_dict = dict(zip(classes, probabilities))
    json_string = json.dumps(probabilities_dict)
    model_response = classes[probabilities.argmax()]

    # SQL query to insert data 
    query = "INSERT INTO " + MYSQL_DATABASE_USER_INPUTS_TABLE
    query += " (user_input, model_response, probabilities) VALUES (%s, %s, %s)"
    cursor.execute(query, (headline, model_response, json_string))

    # closing connection
    conn.commit()
    cursor.close()

# function to save the user feedback to the table
@app.route('/saveFeedback', methods=['POST'])
def save_user_feedback():
    if request.method == 'POST':

        # connect to database
        conn = mysql.connector.connect(**db_config)

        cursor = conn.cursor()

        try: 
            # get the form data
            formData = request.get_json()

            # SQL query to insert data 
            query = "INSERT INTO " + MYSQL_DATABASE_USER_FEEDBACK_TABLE
            query += " (email, first_name, last_name, feedback) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (formData['email'], formData['firstName'], formData['lastName'], formData['feedback']))

            # closing connection
            conn.commit()
            cursor.close()

            return "SUCCESS", 200

        except Exception as e:
            print("error")
            print(f"An unexpected error occurred: {e}")
            cursor.close()
            conn.close()

            return "ERROR", 405
    print("after if")
    return "ERROR", 405

# function to fetch all the past user interactions from the database
@app.route('/getUserInteractions', methods=['GET'])
def get_past_interactions():
    if request.method == 'GET':
        # connecting to database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # query to fetch data from the database
        query = "SELECT * FROM user_interactions"
        try:
            # fetch all the data from the table and return it back
            cursor.execute(query)
            rows = cursor.fetchall()

            # converting the array of arrays to array of objects with the column name as key
            col_names = [desc[0] for desc in cursor.description]
            dict_rows = [dict(zip(col_names, row)) for row in rows]

            cursor.close()
            conn.close()
            return jsonify(dict_rows)
        
        except:
            cursor.close()
            conn.close()
            return jsonify([])
    return jsonify([])

# function that is called to get the prediction for the given headline. The AI model is called here and the results
# are later saved to the database
@app.route('/getHeadlineTag', methods=['POST'])
def get_headline_tag():
    if request.method == 'POST':
        # Access form data
        data = request.get_json()
        headline = data.get('headline')

        # Performing basic text cleaning and converting to word embeddings
        headline = text_clean(headline)
        headline_embedding = bert_model.encode([headline])

        # Loading saved Random Forest model and getting the classification result
        f = open('random_forest_model.pkl', 'rb')
        rf_classifier = pickle.load(f)

        categories = rf_classifier.classes_
        category_probabilities = rf_classifier.predict_proba(headline_embedding)[0]
        category_idx = category_probabilities.argmax()

        # Save interactions to database
        save_to_database(headline, category_probabilities, categories)

        # return the AI model response as a JSON
        return jsonify({
            "class": categories[category_idx], 
            "probability": category_probabilities[category_idx]
        })
    return jsonify({})

# Sample route for checking if server is running
@app.route('/')
def index():
    return 'Flask app running...'

if __name__ == '__main__':
    # Initializing the database on app startup
    initialize_database()
    app.run(debug=True)