from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import sqlite3, random
import smtplib
import os 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import json
import time as Time
import threading
from PIL import Image

app = Flask(__name__)


app.config['SECRET_KEY'] = 'secret'
CORS(app, origins=["https://web-life-client.vercel.app"], supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="https://web-life-client.vercel.app")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

SERVER_NUMBER = 8
SERVER_LIST = []
OBJECT_LIST = []
SERVER_IMG = []

"""web socket events"""

@socketio.on('serverPeople')
def serverPeople():
    # Call your Python function here
    result = getNbServerPeople()
    return {'result': result}

def getNbServerPeople():
    nbr_people = ""

    for serv in SERVER_LIST:
        per_server = 0
        for mail in serv:
            per_server+=1
        nbr_people+=str(per_server)+','
    
    if nbr_people != "":
        return f"{nbr_people}"
    else:
        return f"Error-server_id incorrect"


@socketio.on('getObjectList')
def getObjectList(dict):
    server = dict['server_id']
    # Call your Python function here
    result = getAll(server)
    return {'result': result}
def getAll(server):
    list_str=""
    for elt in OBJECT_LIST:
        if elt[0] == 1:
            if elt[5] == server:
                print(elt[5])
                list_str+=str(elt[0])+"§"+str(elt[1])+"§"+str(elt[2])+"§"+str(elt[3])+"§"+str(elt[4])+'𩸽'
        else:
            if elt[6] == server:
                list_str+=str(elt[0])+"§"+str(elt[1])+"§"+str(elt[2])+"§"+str(elt[3])+"§"+str(elt[4])+"§"+str(elt[5])+'𩸽'

    return list_str


@socketio.on('updatePos')
def updatePos(dict):
    mail = dict['mail']
    server_id = int(dict['server_id'])
    pos_x = dict['pos_x']
    pos_y = dict['pos_y']
    color = dict['color']
    name = dict['name']

    Position(mail, server_id, pos_x, pos_y, color, name)
def Position(mail, server_id, pos_x, pos_y, color, name):
    our_serv = SERVER_LIST[server_id-1]
    if mail in our_serv:
        pers = our_serv[mail]
        pers["pos_x"] = pos_x
        pers["pos_y"] = pos_y
        emit("position", {"mail":mail,"server_id":server_id, "pos_x":pos_x, "pos_y":pos_y, "color":color, "name":name}, broadcast=True)


@socketio.on('addEmojiList')
def addEmojiList(dict):
    code = dict['code']
    is_img = dict['is_img']
    date = dict['date']
    x = dict['pos_x']
    y = dict['pos_y']
    server_id = dict['server_id']
    # Call your Python function here
    addEmoji(code, date, x, y, is_img, server_id)
def addEmoji(code, date, x, y, is_img, server_id):
    OBJECT_LIST.append([0,code, date, x, y, is_img, server_id])
    timer = threading.Timer(2.0, remove, args=(date,))
    timer.start()

@socketio.on('addTextList')
def addTextList(dict):
    code = dict['code']
    date = dict['date']
    player_mail = dict['player_mail']
    player_name = dict['player_name']
    server_id = dict['server_id']
    # Call your Python function here
    addText(code, date, player_mail, player_name, server_id)
def addText(code, date, player_mail, player_name, server_id):
    OBJECT_LIST.append([1,code, date, player_mail, player_name, server_id])
    timer = threading.Timer(2.0, remove, args=(date,))
    timer.start()


def remove(date):
    for emoji in OBJECT_LIST:
        if emoji[2] == date:
            OBJECT_LIST.remove(emoji)

"""fetch events"""

@app.route('/changeServer', methods=['POST'])
def changeServer():
    data = request.get_json()
    server_id = data.get('server_id')
    mail = data.get('mail')
    id_password = data.get('id_password')
    # Call your Python function here
    result = changeServerId(server_id, id_password, mail)
    return jsonify({'result': result})


def changeServerId(id, id_password, mail):
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
        req = f"UPDATE users SET server_id=? WHERE id_password=?;"
        cur.execute(req, (id, id_password))
        conn.commit()
        cur.close()
        conn.close()
        test = removePeopleToServer(mail, id)
        return f"set server id to {id}"

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
            f"INSERT INTO users VALUES ('{name}','{mail}','{password}',1,'#ffffff','#ffffff','{generated_key}','False','');"
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
    color = data.get('color')
    banner_col = data.get('banner_color')
    id = data.get('id')
    # Call your Python function here
    result = Profile(name, password, color, banner_col, id)
    return jsonify({'result': result})

def Profile(name, password, color, banner_col, id):
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

    if color != "":
        cur = conn.cursor()
        req = "UPDATE users SET color=? WHERE id_password=?;"
        cur.execute(req, (color, id))
        conn.commit()
        cur.close()

    if banner_col != "":
        cur = conn.cursor()
        req = "UPDATE users SET banner_color=? WHERE id_password=?;"
        cur.execute(req, (banner_col, id))
        conn.commit()
        cur.close()
    conn.close()

    return "Updated name/passsword/color/banner color"

@app.route('/showPeople', methods=['POST'])
def showPeople():
    data = request.get_json()
    mail = data.get('mail')
    result = setProfile(mail)
    return jsonify({'result': result})
def setProfile(mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT * FROM users WHERE (users.mail='{mail}')"
    cur.execute(req)

    all_infos = ""
    for elt in cur:
        all_infos+=str(elt)
    cur.close()

    conn.close()
    if all_infos != []:
        str_info = str(all_infos).replace('[','').replace(']','').replace('(','').replace(')','').replace("'",'')
        return f"{str_info}"

@app.route('/isFriend', methods=['POST'])
def isFriend():
    data = request.get_json()
    mail = data.get('mail')
    id_password = data.get('id_password')
    result = checkFriendList(mail, id_password)
    return jsonify({'result': result})
def checkFriendList(mail, id_password):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT friend_list FROM users WHERE (users.id_password='{id_password}')"
    cur.execute(req)

    all_friends = []
    for elt in cur:
        all_friends = str(elt)#elt = nana;nini;nono
    cur.close()

    conn.close()
    if mail in all_friends:
        return "True"
    else:
        return "False"

@app.route('/getProfile', methods=['POST'])
def getProfile():
    data = request.get_json()
    mail = data.get('mail')
    result = getProfileOf(mail)
    return jsonify({'result': result})
def getProfileOf(mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT name, server_id, color, banner_color FROM users WHERE (users.mail='{mail}')"
    cur.execute(req)

    infos = ""
    for elt in cur:
        infos+=str(elt)#elt = nana;nini;nono
    cur.close()

    conn.close()
    return infos
    
@app.route('/addFriend', methods=['POST'])
def addFriend():
    data = request.get_json()
    mail = data.get('mail')
    id_password = data.get('id_password')
    result = plusFriend(id_password, mail)
    return jsonify({'result': result})

def plusFriend(id_password, mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT friend_list FROM users WHERE (users.id_password='{id_password}')"
    cur.execute(req)

    returned_val = ""
    for elt in cur:
        returned_val=str(elt)
    cur.close()
    mail_str = ""
    for elt in returned_val.split(";"):
        n_elt=elt.replace('"',"").replace("'","").replace(')',"").replace('(',"").replace(";","").replace(",","")
        if '@' in n_elt:
            if n_elt != mail:
                mail_str+=n_elt+';'
    cur.close()
    #now we add the new mail to the str
    mail_str += mail+";"

    if returned_val == []:
        conn.close()
        return f"Error - couldn't add"
    else:

        cur = conn.cursor()
        req = "UPDATE users SET friend_list=? WHERE id_password=?;"
        cur.execute(req, (mail_str, id_password))
        conn.commit()  # <-- saving changes
        cur.close()

        conn.close()
        return "worked"

@app.route('/removeFriend', methods=['POST'])
def removeFriend():
    data = request.get_json()
    mail = data.get('mail')
    id_password = data.get('id_password')
    result = ridFriend(id_password, mail)
    return jsonify({'result': result})

def ridFriend(id_password, mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT friend_list FROM users WHERE (users.id_password='{id_password}')"
    cur.execute(req)

    returned_val=""
    for elt in cur:
        returned_val=str(elt)
    cur.close()
    mail_str = ""

    if mail not in returned_val:
        conn.close()
        return f"Error - couldn't remove"
    else:
        for elt in returned_val.split(";"):
            n_elt=elt.replace('"',"").replace("'","").replace(')',"").replace('(',"").replace(";","").replace(",","")
            if '@' in n_elt:
                if n_elt != mail:
                    mail_str+=n_elt+';'
            
        cur = conn.cursor()
        req = "UPDATE users SET friend_list=? WHERE id_password=?;"
        cur.execute(req, (mail_str, id_password))
        conn.commit()  # <-- saving changes
        cur.close()

        conn.close()
        return mail_str

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
    body = f"""<pre> <h3>Hello!</h3>

    <p>You requested a password reset, clicking this link will allow you to set a new password for your account:</p>

    Go to the page: <a href="https://web-life-client.vercel.app/templates/password_reset.html?id_password={id_pass}">click here to reset password https://web-life-client.vercel.app/templates/password_reset.html?id_password={id_pass}</a>
    Best regards,
    Web Life Team. (Jk i am single, just me....)
    </pre>"""
    body
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

@app.route('/updateOnlineTrue', methods=['POST'])
def updateOnlineTrue():
    data = request.get_json()
    id_password = data.get('id_password')
    result = setOnline(id_password, True)
    return jsonify({'result': result})

@app.route('/updateOnlineFalse', methods=['POST'])
def updateOnlineFalse():
    try:
        # Parse the raw data from the request
        raw_data = request.data.decode('utf-8')
        data = json.loads(raw_data)  # Convert the raw string to JSON

        id_password = data.get('id_password')

        if not id_password:
            return jsonify({'error': 'Missing id_password'}), 400
        
        result = setOnline(id_password, False)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def setOnline(id_password, is_online):
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
        req = "UPDATE users SET online=? WHERE id_password=?;"
        cur.execute(req, (str(is_online), id_password))
        conn.commit()  # <-- saving changes
        cur.close()

        conn.close()
        return is_online


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
    
    req=f"SELECT name,mail,password,server_id,color,banner_color,online,friend_list FROM users WHERE id_password='{id}';"
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


#multiplayer here


def setServersUp():
    for _ in range(SERVER_NUMBER):
        SERVER_LIST.append({})


@app.route('/addToList', methods=['POST'])
def addToList():
    data = request.get_json()
    name = data.get('name')
    mail = data.get('mail')
    server_id = int(data.get('server_id'))
    color = data.get('color')
    # Call your Python function here
    result = addPeopleToServer(mail, server_id, name, color)
    return jsonify({'result': result})

def addPeopleToServer(mail, server_id, name, color):
    our_serv = SERVER_LIST[server_id-1]
    if mail not in our_serv:
        our_serv[mail] = {}
        pers = our_serv[mail]
        pers["name"] = name
        pers["color"] = color
        pers["pos_x"] = 500
        pers["pos_y"] = 500
    return "worked"

@app.route('/removeToList', methods=['POST'])
def removeToList():
    try:
        # Parse the raw data from the request
        raw_data = request.data.decode('utf-8')
        data = json.loads(raw_data)  # Convert the raw string to JSON

        mail = data.get('mail')

        if not mail:
            return jsonify({'error': 'Missing id_password'}), 400
        
        result = removePeopleFromAllServer(mail)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def removePeopleFromAllServer(mail):
    for serv in SERVER_LIST:
        if mail in serv:
            serv.pop(mail)

def removePeopleToServer(mail, server_id):
    our_serv = SERVER_LIST[server_id-1]
    for serv in SERVER_LIST:
        if serv != our_serv:
            if mail in serv:
                serv.pop(mail)
    return "worked"

@app.route('/ping', methods=['POST'])
def ping():
    data = request.get_json()
    server_id = int(data.get('server_id'))
    # Call your Python function here
    result = checkPing(server_id)
    return jsonify({'result': result})
def checkPing(server_id):
    our_serv = SERVER_LIST[server_id-1]
    return "worked"
@app.route('/pingInsideDatabase', methods=['POST'])
def pingInsideDatabase():
    data = request.get_json()
    mail = data.get('mail')
    # Call your Python function here
    result = checkPingDatabase(mail)
    return jsonify({'result': result})
def checkPingDatabase(mail):
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT name FROM users WHERE mail = '{mail}'"
    cur.execute(req)

    test=[]
    for elt in cur:
        test.append(elt)
    cur.close()
    conn.close()
    return "worked"

@app.route('/checkIFOnline', methods=['POST'])
def checkIFOnline():
    data = request.get_json()
    mail = data.get('mail')
    # Call your Python function here
    result = isOnline(mail)
    return jsonify({'result': result})
def isOnline(mail):
    is_online = False
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT online FROM users WHERE mail = '{mail}'"
    cur.execute(req)

    for elt in cur:
        if elt==True:
            is_online=True
    cur.close()
    conn.close()
    return is_online

@app.route('/getNBPeopleOnline', methods=['POST'])
def getNBPeopleOnline():
    data = request.get_json()
    # Call your Python function here
    result = peopleOnline()
    return jsonify({'result': result})
def peopleOnline():
    nbr=0
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT mail FROM users WHERE online='True'"
    cur.execute(req)

    for _ in cur:
        nbr+=1
    cur.close()
    conn.close()
    return nbr

@app.route('/getNBPeople', methods=['POST'])
def getNBPeople():
    data = request.get_json()
    # Call your Python function here
    result = people()
    return jsonify({'result': result})
def people():
    nbr=0
    conn = sqlite3.connect('databases/profile_database.db')
    cur = conn.cursor()
    
    req=f"SELECT mail FROM users"
    cur.execute(req)

    for _ in cur:
        nbr+=1
    cur.close()
    conn.close()
    return nbr


@app.route('/uploadImg', methods=['POST'])
def uploadImg():
    data = request.get_json()
    file = data.get('file')
    print(file)  # This should now print!

    img = Image.open(file)
    img.save('saved_img/img'+str(len(SERVER_IMG))+f'.{file.type}')
    # Call your Python function here
    result = Images(img)
    return jsonify({'result': result})

def Images(img):
    name = "image_"+len(SERVER_IMG)
    SERVER_IMG[name] = img
    return name

#cool database
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
    code=""
    for elt in list_rand_letters:
        code+=alphabet[elt]
    for num in list_rand_numbers:
        code+=str(numbers[num])
    
    return code

if __name__ == '__main__':
    setServersUp()
    socketio.run(app, host="0.0.0.0", debug=True, port=5000)
