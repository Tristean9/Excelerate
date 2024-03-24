import io
import base64
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from services.file_rule_maker import FileRuleMaker
from services.file_validator import FileValidator
from io import BytesIO
from utils import excel_processor
import json
import openpyxl as px

app = Flask(__name__)
CORS(app)

fuker = FileRuleMaker()
fileValidator = FileValidator()


@app.route("/save_rawFile", methods=["POST"])
def save_raw_file():
    file = request.files.get("file")
    file_name = request.files.get("file").filename
    file_stream = io.BytesIO(file.read())

    if file:
        # 转换处理
        if file_name.endswith(".xls"):
            file_stream = excel_processor.Excel_IO().convert_excel_format(
                file_stream, "xls", "xlsx", True
            )

        # 给file_rule_maker 的属性赋值
        fuker.get_file_stream(file_stream, file_name)

        # 发送处理后的文件给前端
        byte_stream = io.BytesIO()
        byte_stream.write(file_stream.getvalue())
        byte_stream.seek(0)  # 跳转到流的开头
        return send_file(
            byte_stream,
            mimetype="application/vnd.ms-excel",
            as_attachment=True,
            download_name=file_name,
        )


@app.route("/generate_user_rule_dict", methods=["POST"])
def generate_user_rule_dict():
    fields_index_col_list = json.loads(request.form.get("fields"))
    fields_index_col_dict = {
        field["position"]: field["fieldName"] for field in fields_index_col_list
    }
    # print(file, file_name,fields_index_col_dict)

    if fields_index_col_dict:
        print("fields_index_col_dict: ", fields_index_col_dict)
        field_rules = fuker.generate_user_rule_dict(fields_index_col_dict)
        print("field rules: ", field_rules)
        return jsonify(field_rules)
    return "Error processing file", 500


@app.route("/create_final_rules_and_examples", methods=["POST"])
def create_final_rules_and_examples_file():
    selected_field_rules = json.loads(request.form.get("finalRules"))
    print("selected_field_rules: ", selected_field_rules)
    final_rules_and_examples, simulate_rule_excel_stream_dict = (
        fuker.create_final_rules_and_examples(selected_field_rules)
    )

    # 发送处理后的文件给前端
    file_data = {}
    for mode, simulate_rule_excel_stream in simulate_rule_excel_stream_dict.items():
        byte_stream = io.BytesIO()
        byte_stream.write(simulate_rule_excel_stream.getvalue())
        byte_stream.seek(0)  # 跳转到流的开头

        # 将数据流转换为Base64编码的字符串
        file_data[mode] = base64.b64encode(byte_stream.getvalue()).decode("utf-8")

    return jsonify(file_data), 200


@app.route("/load_and_check_data", methods=["POST"])
def load_and_check_data():
    excelFile = request.files.get("excelFile")
    excel_stream = io.BytesIO(excelFile.read())
    excelFile_name = excelFile.filename

    ruleFile = request.files.get("ruleFile")

    rule_dict = json.loads(ruleFile.read().decode("utf-8"))
    # print("rule_dict:", rule_dict)

    new_excel = fileValidator.get_files_stream(excel_stream, excelFile_name, rule_dict)
    # print(new_excel)
    _, checked_excel, error_index_col = fileValidator.validate_filled_excel(new_excel)

    print("error_index_col", error_index_col)
    checked_excel_error = {
        "error_index_col": error_index_col,
        "checked_excel": base64.b64encode(checked_excel.getvalue()).decode("utf-8"),
    }

    # 发送处理后的文件给前端
    return jsonify(checked_excel_error), 200


@app.route("/check_data", methods=["POST"])
def check_data():
    # print("request.files",request.files)
    excelFile = request.files.get("excelFile")
    excel_stream = io.BytesIO(excelFile.read())
    
    # with open("./tmp/checked_excel.xlsx", "wb") as f:
        # f.write(excel_stream.getvalue())
        
    # wb = px.load_workbook(excel_stream)
    # ws = wb.worksheets[0]
    
    # fileValidator.Xio.read_excel_file("./tmp/checked_excel.xlsx")

    # new_excel = fileValidator.get_files_stream(excel_stream, "text.xlsx", {})
    # # print(new_excel)

    # _, checked_excel, error_index_col = fileValidator.validate_filled_excel(new_excel)

    # print("excel_stream", excel_stream)
    _, checked_excel, error_index_col = fileValidator.validate_filled_excel(
        excel_stream
    )
    excel_stream.seek(0)
    wb = px.load_workbook(excel_stream)
    ws = wb.worksheets[1]
    # 遍历工作表中的所有行
    for row in ws.iter_rows(values_only=True):
        # 对每一行的单元格值使用\t进行连接，形成一个字符串
        row_data = '\t'.join([str(cell) if cell is not None else '' for cell in row])
        # 打印该行，行间自然由print提供的\n进行分隔
        print(row_data)
        
    print("error_index_col", error_index_col)
    # 发送处理后的文件给前端
    checked_excel_error = {
        "error_index_col": error_index_col,
        "checked_excel": base64.b64encode(checked_excel.getvalue()).decode("utf-8"),
    }

    # 发送处理后的文件给前端
    return jsonify(checked_excel_error), 200


if __name__ == "__main__":
    app.run()
