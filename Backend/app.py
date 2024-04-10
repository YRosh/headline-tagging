from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
import pymysql
from sentence_transformers import SentenceTransformer
import re
import pickle
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])


app.config['MYSQL_DATABASE_HOST'] = 'localhost' # SQL server host
app.config['MYSQL_DATABASE_USER'] = 'root' # SQL server root user name
app.config['MYSQL_DATABASE_PASSWORD'] = 'roshlvVK@14' # SQL server root user password
app.config['MYSQL_DATABASE_DB'] = 'news_headlines_classification' # SQL database name
app.config['MYSQL_DATABASE_USER_INPUTS_TABLE'] = 'user_interactions' # user interactions table name
app.config['MYSQL_DATABASE_USER_FEEDBACK'] = 'user_feedback' # user feedbacks table name

mysql = MySQL(app)

bert_model = SentenceTransformer('bert-base-nli-mean-tokens')

def text_clean(text):
  text = re.sub(r'[^A-Za-z0-9 .]+', '', text)
  return text

def initialize_database():

    try:
        # Connecting to SQL server
        conn = mysql.connect()

        # Create a cursor object
        cursor = conn.cursor()

        # Selecting the database
        cursor.execute("USE {}".format(app.config['MYSQL_DATABASE_DB']))

        # Check if the user inputs table exists
        cursor.execute("SHOW TABLES LIKE '{}'".format(app.config['MYSQL_DATABASE_USER_INPUTS_TABLE']))
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
            """.format(app.config['MYSQL_DATABASE_USER_INPUTS_TABLE'])
            cursor.execute(query)
        
        # Check if the user feedback table exists
        cursor.execute("SHOW TABLES LIKE '{}'".format(app.config['MYSQL_DATABASE_USER_FEEDBACK']))
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
            """.format(app.config['MYSQL_DATABASE_USER_FEEDBACK'])
            cursor.execute(query)

        # Commit changes and close cursor and connection
        conn.commit()
        cursor.close()
        conn.close()
    
    except pymysql.Error as e:
        print("Error: \n", e)

def save_to_database(headline, probabilities, classes):
    # connect to database
    conn = mysql.connect()
    cursor = conn.cursor()

    # convert the data to the format required for table
    probabilities_dict = dict(zip(classes, probabilities))
    json_string = json.dumps(probabilities_dict)
    model_response = classes[probabilities.argmax()]

    # SQL query to insert data 
    query = "INSERT INTO user_interactions (user_input, model_response, probabilities) VALUES (%s, %s, %s)"
    cursor.execute(query, (headline, model_response, json_string))

    # closing connection
    conn.commit()
    cursor.close()

@app.route('/getUserInteractions', methods=['GET'])
def get_past_interactions():
    if request.method == 'GET':
        # connecting to database
        conn = mysql.connect()
        cursor = conn.cursor()

        # query to fetch data from the database
        query = "SELECT * FROM user_interactions"
        try:
            # fetch all the data from the table and return it back
            cursor.execute(query)
            rows = cursor.fetchall()

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

# Initializing the database on app startup
@app.before_first_request
def setup():
    initialize_database()

# Sample route for checking if server is running
@app.route('/')
def index():
    return 'Flask app running...'

if __name__ == '__main__':
    app.run(debug=True)