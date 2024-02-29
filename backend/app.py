from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from services.file_rule_maker import FileRuleMaker
from io import BytesIO
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)

'''
@app.route('/extract_fields_from_excel', methods=['POST'])
def extract_fields_from_excel():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files["file"]
    if file.filename == "":
        return "No selected file", 400
    if file:
        field_names, modified_excel_stream = FileRuleMaker().extract_fields_from_excel(file)
        return send_file(modified_excel_stream, as_attachment=True, download_name="modified.xlsx",
                         mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return "Error processing file", 500
'''


@app.route('/generate_user_rule_dict', methods=['POST'])
def generate_user_rule_dict():
    file = request.files.get("file")
    file_name = request.files.get("file").filename
    fields_index_col_list = json.loads(request.form.get("fields"))
    fields_index_col_dict = {field['position']: field['fieldName'] for field in fields_index_col_list}
    #print(file, file_name,fields_index_col_dict)

    #print(type(file))
    if file.filename == "":
        return "No selected file", 400
    if file:
        Field_rules = FileRuleMaker().generate_user_rule_dict(file, file_name, fields_index_col_dict)
        #return send_file(Field_rules, as_attachment=True, download_name="modified.xlsx",
                         #mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return "Error processing file", 500


if __name__ == '__main__':
    app.run()
