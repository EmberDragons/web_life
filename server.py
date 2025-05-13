from flask import Flask, request, jsonify
from flask_cors import CORS,cross_origin
import sqlite3, random
import smtplib
import os 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app, supports_credentials=True)  # This will enable CORS for all routes


SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    mail = data.get('mail')
    password = data.get('password')
    # Call your Python function here
    result = checkLogIn(mail, password)
    return jsonify({'result': result})

def checkLogIn(mail, password):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT * FROM users WHERE (users.mail='{mail}')"
    cur.execute(req)

    returned_val=[]
    for elt in cur:
        returned_val.append(elt)
    cur.close()

    if returned_val == []:
        conn.close()
        return f"Error-not_in_data_base"
    else:
        cur = conn.cursor()
    
        req=f"SELECT * FROM users WHERE (users.mail='{mail}' and users.password='{password}');"
        cur.execute(req)

        returned_val=[]
        for elt in cur:
            returned_val.append(elt)
        cur.close()
        conn.close()
        if returned_val == []:
            return "Error-password_incorrect"
        else:
            return f"{returned_val[0][6]}"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    mail = data.get('mail')
    password = data.get('password')
    # Call your Python function here
    result = checkRegister(name, mail, password)
    return jsonify({'result': result})

def checkRegister(name, mail, password):
    conn = sqlite3.connect('databases/profile_database.db')

    new_cur = conn.cursor()
    req_server = (
        f"SELECT * FROM users WHERE mail = '{mail}';"
    )
    new_cur.execute(req_server)

    returned_val=[]
    for elt in new_cur:
        returned_val.append(elt)
    new_cur.close()


    if returned_val != []:
        conn.close()
        return f"Error-already_in_database"
    else:
        cur = conn.cursor()
        
        database_codes = getDatabaseCodes()
        generated_key = generateKey()
        while generated_key in database_codes:
            generated_key = generateKey()


        req = (
            f"INSERT INTO users VALUES ('{name}','{mail}','{password}',0,'0','0','{generated_key}');"
        )
        cur.execute(req)
        conn.commit()  # <-- saving changes
        cur.close()

        conn.close()
        return f"worked"

@app.route('/updateProfile', methods=['POST'])
def updateProfile():
    
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    id = data.get('id')
    # Call your Python function here
    result = Profile(name, password, id)
    return jsonify({'result': result})

def Profile(name, password, id):
    conn = sqlite3.connect('databases/profile_database.db')

    if name != "":
        cur = conn.cursor()
        req = f"UPDATE users SET name=? WHERE id_password=?;"
        cur.execute(req, (name, id))
        conn.commit()
        cur.close()

    if password != "":
        cur = conn.cursor()
        req = "UPDATE users SET password=? WHERE id_password=?;"
        cur.execute(req, (password, id))
        conn.commit()
        cur.close()
    conn.close()

    return "Updated name/passsword"

@app.route('/changePassword', methods=['POST'])
def changePassword():
    data = request.get_json()
    id_password = data.get('id_password')
    new_password = data.get('new_password')
    result = setPassword(id_password, new_password)
    return jsonify({'result': result})

def setPassword(id_password, new_password):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT * FROM users WHERE (users.id_password='{id_password}')"
    cur.execute(req)

    returned_val=[]
    for elt in cur:
        returned_val.append(elt)
    cur.close()

    if returned_val == []:
        conn.close()
        return f"Error"
    else:
        cur = conn.cursor()
        req = "UPDATE users SET password=? WHERE id_password=?;"
        cur.execute(req, (new_password, id_password))
        conn.commit()  # <-- saving changes
        cur.close()

        conn.close()
        return f"worked"

@app.route('/changePasswordRequest', methods=['POST'])
def changePasswordRequest():
    data = request.get_json()
    mail = data.get('email')
    id_pass=checkIdPasswordFromMail(mail)
    result="Error - Wrong Email"
    if id_pass!="Error":
        # Call your Python function here
        result = resetRequest(mail, id_pass)
    return jsonify({'result': result})
def resetRequest(mail, id_pass):
    subject='Reset Email'
    body=(f"""\
    <h3>Hello!</h3>

    <p>You requested a password reset, clicking this link will allow you to set a new password for your account:</p>

    <a href='password_reset.html'>http://localhost:8000/password_reset.html?id_password={id_pass}</a>
    <br>
    <a>--Web life Bot</a>
    """)
    msg = send_mail(mail, subject, body)

    return msg

def send_mail(recipient_email,subject,body):
    try:
        msg=MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS,EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())

        return "Sent !"
    
    except Exception as e:
        return f"Error : {e}"

def checkIdPasswordFromMail(mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT * FROM users WHERE (users.mail='{mail}')"
    cur.execute(req)

    returned_val=[]
    for elt in cur:
        returned_val.append(elt)
    cur.close()

    if returned_val == []:
        conn.close()
        return f"Error"
    else:
        cur = conn.cursor()
    
        req=f"SELECT * FROM users WHERE (users.mail='{mail}');"
        cur.execute(req)

        returned_val=[]
        for elt in cur:
            returned_val.append(elt)
        cur.close()
        conn.close()
        return f"{returned_val[0][6]}"

@app.route('/communicate', methods=['POST'])
def communicate():
    data = request.get_json()
    id = data.get('id')
    # Call your Python function here
    result = Communicate(id)
    return jsonify({'result': result})

def Communicate(id):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT name,mail,password,server_id,position_x,position_y FROM users WHERE id_password='{id}';"
    cur.execute(req)

    all_infos = ""
    for elt in cur:
        all_infos+=str(elt)
    cur.close()

    conn.close()
    if all_infos != []:
        str_info = str(all_infos).replace('[','').replace(']','').replace('(','').replace(')','').replace("'",'')
        return f"{str_info}"
    else:
        return f"Error-idpassword incorrect"


def getDatabaseCodes():
    codes=[]
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT id_password FROM users"
    cur.execute(req)

    for elt in cur:
        codes.append(elt)
    cur.close()
    conn.close()
    return codes

def generateKey():
    numbers = [1,2,3,4,5,6,7,8,9]
    alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    list_rand_letters = [random.randint(0,len(alphabet)-1) for _ in range(10)]
    list_rand_numbers = [random.randint(0,len(numbers)-1) for _ in range(5)]
    print(list_rand_letters, list_rand_numbers)
    code=""
    for elt in list_rand_letters:
        code+=alphabet[elt]
    for num in list_rand_numbers:
        code+=str(numbers[num])
    
    return code

if __name__ == '__main__':

    app.run(debug=True)


