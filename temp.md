我从前端发送了一个数据后，服务器接收并保存了下来，以为某个对象的属性赋值的形式，保存的类型为数据流。在第一次发送请求服务时一切正常，但是当我重复发送的时候，就报错了，从打印的结果来看，之前保存的数据流还在，但是我的方法里就报错了。
报错：
127.0.0.1 - - [06/Mar/2024 19:28:34] "POST /save_rawFile HTTP/1.1" 200 -
{'A1': '性别', 'B1': '所在院系'}
<_io.BytesIO object at 0x000001BE3067D1C0>
[<openpyxl.worksheet.datavalidation.DataValidation object>
Parameters:
sqref=<MultiCellRange [A1:A29]>, showDropDown=False, showInputMessage=True, showErrorMessage=True, allowBlank=False, errorTitle=None, error=None, promptTitle=None, prompt=None, type='list', errorStyle=None, imeMode=None, operator=None, formula1='"111,222,333"', formula2=None]
{'性别': {'对应列下拉列表规则': [['111', '222', '333']], '程序预定义规则': [['男', '女']]}, '所在院系': {'对应列下拉列表规则': [], '程序预定义规则': ''}}
field rules:  {'性别': {'对应列下拉列表规则': [['111', '222', '333']], '程序预定义规则': [['男', '女']]}, '所在院系': {'对应列下拉列表规则': [], '程序预定义规则': ''}}
127.0.0.1 - - [06/Mar/2024 19:28:37] "POST /generate_user_rule_dict HTTP/1.1" 200 -
{'A1': '性别', 'B1': '所在院系'}
<_io.BytesIO object at 0x000001BE3067D1C0>
[2024-03-06 19:28:45,463] ERROR in app: Exception on /generate_user_rule_dict [POST]
Traceback (most recent call last):
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\flask\app.py", line 1463, in wsgi_app
    response = self.full_dispatch_request()
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\flask\app.py", line 872, in full_dispatch_request
    rv = self.handle_user_exception(e)
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\flask_cors\extension.py", line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
                                                ^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\flask\app.py", line 870, in full_dispatch_request
    rv = self.dispatch_request()
         ^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\flask\app.py", line 855, in dispatch_request
    return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)  # type: ignore[no-any-return]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "G:\Undergraduate\ChallengeCup\Excelerate\backend\app.py", line 50, in generate_user_rule_dict
    field_rules = fuker.generate_user_rule_dict(fields_index_col_dict)
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "G:\Undergraduate\ChallengeCup\Excelerate\backend\services\file_rule_maker.py", line 82, in generate_user_rule_dict
    self.excel_wb, self.excel_ws = self.excel_wb, self.excel_ws = self.Xio.load_workbook_from_stream(excel_got)
                                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "G:\Undergraduate\ChallengeCup\Excelerate\backend\utils\excel_processor.py", line 36, in load_workbook_from_stream
    return self.read_excel_file(excel_bytes)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "G:\Undergraduate\ChallengeCup\Excelerate\backend\utils\excel_processor.py", line 21, in read_excel_file
    excel_wb = px.load_workbook(excel_path, data_only=True)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\openpyxl\reader\excel.py", line 344, in load_workbook
    reader = ExcelReader(filename, read_only, keep_vba,
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\openpyxl\reader\excel.py", line 123, in __init__
    self.archive = _validate_archive(fn)
                   ^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\site-packages\openpyxl\reader\excel.py", line 95, in _validate_archive
    archive = ZipFile(filename, 'r')
              ^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Anaconda\envs\Excelerate\Lib\zipfile\__init__.py", line 1341, in __init__
    self._RealGetContents()
  File "E:\Anaconda\envs\Excelerate\Lib\zipfile\__init__.py", line 1408, in _RealGetContents
    raise BadZipFile("File is not a zip file")
zipfile.BadZipFile: File is not a zip file
127.0.0.1 - - [06/Mar/2024 19:28:45] "POST /generate_user_rule_dict HTTP/1.1" 500 -

代码：
import os, sys, io
import openpyxl as px
from openpyxl.styles import Font, Border, Side, PatternFill, Alignment, Protection
from openpyxl.utils import get_column_letter

"""用于导入项目中不在同一文件夹的库"""
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils.excel_processor as XPRO
import utils.string_processor as StringPRO


class FileRuleMaker:  # 进一步：考虑将Xio对象作为FileRuleMaker的属性，贯穿始终
    def __init__(self):
        # 创建空对象占位，后续修改值，供整个类使用
        self.file_name = ""  # get_file_stream中修改
        self.file_stream = None  # get_file_stream中修改
        self.excel_wb, self.excel_ws = None, None  # generate_user_rule_dict中修改
        self.Sheet_dropdowns = None  # generate_user_rule_dict中修改
        self.Xattr = None  # generate_user_rule_dict中修改
        self.file_rule_dict = dict()  # create_final_rules_and_examples中修改

        # 一开始即创建，然后在整个类均可调用
        self.Xio = XPRO.Excel_IO()  # 自动创建，读写全部用这个对象读取。
        self.predefined_rules_path = "rules/predefined_rules.json"  # 预定义规则文件的位置
        self.predefined_rules = XPRO.read_from_json_file(self.predefined_rules_path)  # 预定义规则对象
        self.rule_choice_sepaprator = ","  # 进一步：考虑后端存储列表类型相关内容，传给前端的是join为字符串的内容，默认以英文逗号间隔同一规则内的各个选项，可用户自定义修改

    def get_file_stream(self,
                        excel_got: io.BytesIO,
                        file_name: str,
                        ) -> io.BytesIO:
        """
            从数据流接收  ：含字段的空文件+其文件名
            输出到数据流  ：转化后(若需)的含字段的文件数据流

            Parameters from stream:
                excel_got (excel_file): 含字段的内容空白的Excel文件
                file_name (str):
                    content:该Excel文件的文件名
                    format :"test.xls(x)"
        """
        self.file_name = file_name
        self.file_stream = excel_got
        if self.file_name.endswith("xlsx"):
            return self.file_stream
        elif self.file_name.endswith("xls"):
            self.file_stream = self.Xio.convert_excel_format(self.file_stream, "xls", "xlsx", True)
            return self.file_stream  # 进一步：后端转化格式。修改self.excel_got变量
        else:
            raise TypeError  # 进一步：报错内容文本商讨。后端传输代号，前端呈现错误信息。

    def generate_user_rule_dict(self,
        
        # 获取文件并转化
        excel_got = self.file_stream
        print(excel_got)
        self.excel_wb, self.excel_ws = self.excel_wb, self.excel_ws = self.Xio.load_workbook_from_stream(excel_got)

        # 读取对象并获取属性
        self.Xattr = XPRO.Excel_attribute(self.excel_wb, self.excel_ws)
        ""
        # 进一步：改进字段名与预设规则的匹配方法
        # 匹配字段位置与字段单元格对象、字段值，已根据字段位置的先后sorted排序
        fields_index_col_to_cell_name = {index_col: [self.excel_ws[index_col], fields_index_col[index_col]] for
                                         index_col in sorted(fields_index_col.keys())}
        # return fields_index_col_to_cell_name
        # 设定用户可选规则字典 注：Python 3.6之后，字典是有序的
        self.Sheet_dropdowns = self.Xattr.get_dropdowns()
        Field_rules = {name:
                           dict(zip(["对应列下拉列表规则", "程序预定义规则"],
                                    [self.Sheet_dropdowns[col_index[0]] if col_index[0] in self.Sheet_dropdowns else [],
                                     self.predefined_rules[
                                         StringPRO.best_match(name, list(self.predefined_rules.keys()))]
                                     ])) for col_index, (cell, name) in fields_index_col_to_cell_name.items()}
        print(Field_rules)
        return Field_rules

    def create_final_rules_and_examples(self,
                                        selected_field_rules: dict):
        
        selected_field_rules = {k: v for k, v in selected_field_rules.items() if v[1]}  # 去掉规则列表没有内容的字段
        final_rules_and_examples = {}
        # 设置规则样例行和最终规则样例dict
        for one_index_col, (field_name, rule_list) in selected_field_rules.items():
            final_rules_and_examples[one_index_col] = [field_name,
                                                       StringPRO.generate_strict_regex_and_example(rule_list)]
            example = final_rules_and_examples[one_index_col][-1][-1]
            self.Xattr.set_validation_rules_and_example(one_index_col, field_name, rule_list, example)

        # 设置下拉列表
        self.Xattr.set_dropdowns(selected_field_rules)

        self.file_rule_dict = final_rules_and_examples
        simulate_rule_excel = self.Xio.stream_excel_to_frontend(self.excel_wb)
        return final_rules_and_examples, simulate_rule_excel








import openpyxl as px
import io, json, re, os, warnings, shutil
from openpyxl.styles import Font, Border, Side, PatternFill, Alignment, Protection
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import range_boundaries
import win32com.client as win32
import pythoncom

warnings.filterwarnings("ignore", category=UserWarning)


class Excel_IO:
    def __init__(self):
        # Excel格式映射
        self.FORMATS = {'xls': 56, 'xlsx': 51}
        self.temp_path = "tmp/"

    def read_excel_file(self, excel_path, sheet_index=0):
        """openpyxl读取某路径的excel文件"""
        try:
            excel_wb = px.load_workbook(excel_path, data_only=True)
            excel_ws = excel_wb.worksheets[sheet_index]
            return (excel_wb, excel_ws)
        except IOError as e:
            print(f"An error occurred during reading: {e}")
            # Handle the exception as needed
            return None

    def load_workbook_from_stream(self, excel_stream, sheet_index=0):
        """openpyxl读取某数据流的excel文件"""
        if 1:  # try:
            # 读取流中的内容为二进制数据
            excel_data = excel_stream.read()
            # 使用BytesIO创建一个类似文件的对象
            excel_bytes = io.BytesIO(excel_data)
            return self.read_excel_file(excel_bytes)

    def save_excel(self, excel_wb, excel_path):
        """openpyxl传输wb对象到excel文件"""
        try:
            excel_wb.save(excel_path)
        except IOError as e:
            print(f"An error occurred during saving: {e}")

    def stream_excel_to_frontend(self, excel_wb):
        """openpyxl传输wb对象到excel数据流"""
        try:
            # 创建一个BytesIO对象来保存Excel文件
            excel_stream = io.BytesIO()

            # 将workbook保存到这个BytesIO流中
            excel_wb.save(excel_stream)

            # 重置流的位置到开始处，这样就可以读取它的内容了
            excel_stream.seek(0)

            # 返回流对象
            return excel_stream
        except IOError as e:
            print(f"An error occurred during streaming: {e}")
            return None

    def convert_excel_format(self, input_bytes, src_format, dst_format, save_dst=True):
        """根据参数将数据流中的excel格式进行转化，并输出为数据流,默认在temp文件夹中产生的临时文件"""
        # 初始化 COM 库
        pythoncom.CoInitialize()

        # 清理之前的临时文件
        clear_directory(self.temp_path)

        # 确保源格式和目标格式是受支持的
        if src_format not in self.FORMATS or dst_format not in self.FORMATS:
            raise ValueError('Unsupported format specified.')

        src_tempfile_path = os.path.abspath(os.path.join(self.temp_path, f"temp.{src_format}"))
        dst_tempfile_path = os.path.abspath(os.path.join(self.temp_path, f"temp.{dst_format}"))

        # 创建 Excel 对象
        # print("excel: win32")
        excel = win32.gencache.EnsureDispatch('Excel.Application')
        # print("excel: visible")
        excel.Visible = False  # 不显示Excel界面

        # 创建输出流
        output_io = io.BytesIO()

        # 将输入BytesIO对象中的内容写入临时源文件
        with open(src_tempfile_path, "wb") as temp_file:
            temp_file.write(input_bytes.getvalue())
        # 打开源文件
        workbook = excel.Workbooks.Open(os.path.abspath(src_tempfile_path))

        # 另存为目标格式的文件
        workbook.SaveAs(dst_tempfile_path, FileFormat=self.FORMATS[dst_format])
        workbook.Close(True)

        # 读取目标文件到BytesIO对象
        with open(dst_tempfile_path, "rb") as temp_file:
            output_io.write(temp_file.read())

        # 清理临时文件
        os.remove(src_tempfile_path)

        # 在最后的保存excel步骤，可先保留文件至temp文件夹，再传输到用户选择的文件夹
        if not save_dst:
            os.remove(dst_tempfile_path)

        # 关闭 Excel 进程
        excel.Application.Quit()

        # 设置输出流的指针回到起始位置，以便于读取
        output_io.seek(0)
        return output_io


class Excel_attribute:
    """目前只考虑了一个工作簿&其一个工作表的修改，进一步：无法实现多个工作表同时修改"""

    def __init__(self, excel_wb=None, excel_ws=None):
        """类无传输值分别表示创建新wb、读取wb第一个工作表"""
        if excel_wb is None:
            self.excel_wb = px.Workbook()
            self.excel_ws = self.excel_wb.active
        else:
            self.excel_wb = excel_wb
            self.excel_ws = excel_ws if excel_ws is not None else excel_wb.worksheets[0]

    def get_some_axis_cells(self, index, value_only=True):
        """获取某一行/列的单元格，依据参数返回单元格对象或值的list"""
        transform_cell = lambda cell: cell.value if value_only == True else cell
        excel_field = [transform_cell(cell) for cell in self.excel_ws[index] if cell.value]
        return excel_field

    def get_max_row_col(self):
        """worksheet提供的属性来获取最大行列数问题：目前发现单元格有颜色填充、字色等也会被视为有内容的单元格；
           根据值遍历出的最大行列数则无此问题
           此外，纯下拉列表无选择值，二者都不会视为单元格有内容
           故返回两种方法分别产生的最大行列数集合"""
        px_max_row = self.excel_ws.max_row
        px_max_col = self.excel_ws.max_column
        value_max_row = 0
        value_max_col = 0
        for row in self.excel_ws.iter_rows():
            for cell in row:
                if cell.value is not None:
                    value_max_row = max(value_max_row, cell.row)
                    value_max_col = max(value_max_col, cell.column)
        return {"max_row": {px_max_col, value_max_col},
                "max_col": {px_max_row, value_max_row}}

    def modify_cell_style(self, cell, font=None, border=None, fill=None,
                          number_format=None, protection=None,
                          hyperlink=None, alignment=None):
        """根据对象性参数修改某一单元格的字体、边框、填充、数字格式、保护方式、超文本、对齐格式等"""
        # Check if cell is a string reference or a Cell object
        if isinstance(cell, str):
            cell = self.excel_ws[cell]

        # Apply styles as provided
        # Create a dictionary with attribute names and the values provided
        style_attributes = {
            'font': font, 'border': border, 'alignment': alignment,
            'fill': fill, 'number_format': number_format,
            'protection': protection, 'hyperlink': hyperlink}

        # Apply styles as provided
        for attr_name, attr_value in style_attributes.items():
            if attr_value is not None:
                setattr(cell, attr_name, attr_value)  # Set attribute by name

    def modify_CertainRange_style(self, cell_range, **style_kwargs):
        """根据对象性参数修改某一单元格区域的字体、边框、填充、数字格式、保护方式、超文本、对齐格式等"""
        # Convert cell range to actual range
        min_col, min_row, max_col, max_row = range_boundaries(cell_range)

        # Iterate over all cells in the range
        for row in range(min_row, max_row + 1):
            for col in range(min_col, max_col + 1):
                cell = self.excel_ws.cell(row=row, column=col)
                self.modify_cell_style(cell, **style_kwargs)

    def modify_MutipleRange_style(self, cell_range_list, **style_kwargs):
        """根据对象性参数修改某一多分布单元格区域的字体、边框、填充、数字格式、保护方式、超文本、对齐格式等"""
        if type(cell_range_list) == str: cell_range_list = [cell_range_list]
        for cell_range in cell_range_list:
            self.modify_CertainRange_style(cell_range, **style_kwargs)

    def get_dropdowns(self):
        """获取工作表内的各列的下拉列表字典，同一行多种下拉列表的以list组织"""

        def get_dropdowns_values(validation):
            result = validation.formula1

            # 进一步，下拉列表不仅仅为序列
            # 若值为工作表单元格引用

            # 捕获组 (.*!)? 是可选的，用来匹配任意字符后跟一个感叹号 !，代表可能存在的工作表名称。
            pattern = r"^(.*!)?(\$?[A-Za-z]\$?\d+:\$?[A-Za-z]\$?\d+)$"
            match_ = re.search(pattern, result)
            if match_:
                match_groups = match_.groups()
                # 若跨工作表引用(预计更为合理)
                if (match_groups)[0]:
                    sheet_name = match_groups[0][:-1]
                    sheet_name = sheet_name[1:-1] if sheet_name[0] == sheet_name[-1] == "'" else sheet_name
                    dropdown_sourcesheet = self.excel_wb[sheet_name]
                else:
                    dropdown_sourcesheet = self.excel_ws
                # 默认被引用为数据验证的单元格不止一个
                min_col, min_row, max_col, max_row = range_boundaries(match_groups[-1].replace('$', ''))
                value_list = []
                for i in range(min_row, max_row + 1):
                    for j in range(min_col, max_col + 1):
                        value_list.append(dropdown_sourcesheet.cell(i, j).value)
                return value_list

            # 若值为简单的手动输入序列
            elif "," in result:
                # 去除首尾的引号后，直接拆分为值
                return result[1:-1].split(',')

        drop_row = dict()

        # 含有当前工作表的所有有效性验证的对象
        validations = self.excel_ws.data_validations.dataValidation
        print(validations)
        for validation in validations:

            # 当前有效性涉及区域
            cell = str(validation.sqref)

            # 目前的方式，仅匹配下拉列表选择所以值的。进一步：考虑介于等多种方式
            result = (get_dropdowns_values(validation))

            # 如果是多列的下拉列表相同，分别进行检验
            if " " in cell:
                cells = cell.split(" ")
                for i in cells:
                    if i[0] not in drop_row:
                        drop_row[i[0]] = [result]
                    elif set(result) in [set(already_result) for already_result in drop_row[i[0]]]:
                        continue
                    else:
                        drop_row[i[0]].append(result)
            else:
                if (cell)[0] not in drop_row:
                    drop_row[(cell)[0]] = [result]
                else:
                    drop_row[cell[0]].append(result)
        return drop_row

    def create_or_update_dv_list(self, field, rule_list):
        """将过长的下拉列表中的选项写入隐藏的工作表中,工作表中各列内容：
            A           B           C
        1   A1序号      C1院系(新表列号与旧表列号不必一直)
        2   下拉列表值1  下拉列表值1  .
        3   下拉列表值2  下拉列表值2  .
        4   下拉列表值3  下拉列表值3  .
        5   下拉列表值4  下拉列表值4  .
        6   下拉列表值5  下拉列表值5  .
        7   下拉列表值6  下拉列表值6  .
        """
        # 检查是否存在名为'sheet_for_DataValidate'的工作表，如果没有则创建
        sheet_name = 'sheet_for_DataValidate'
        if sheet_name not in self.excel_wb.sheetnames:
            dv_sheet = self.excel_wb.create_sheet(sheet_name)
            dv_sheet.sheet_state = 'hidden'  # 隐藏工作表
        else:
            dv_sheet = self.excel_wb[sheet_name]

        # 查找为空的列（即没有数据验证列表的列）
        col_index = 1
        while dv_sheet.cell(row=2, column=col_index).value is not None:
            col_index += 1

        # 在找到的列的第一行中写入字段名
        dv_sheet.cell(row=1, column=col_index, value=field)

        # 从第二行开始写入规则列表
        for index, item in enumerate(rule_list, start=2):
            dv_sheet.cell(row=index, column=col_index, value=item)

        # 返回引用区域的字符串，例如'Sheet2!$B$2:$B$100'
        return f"'{sheet_name}'!${dv_sheet.cell(row=2, column=col_index).column_letter}$2:${dv_sheet.cell(row=2, column=col_index).column_letter}${len(rule_list) + 1}"

    def set_dropdowns(self, selected_field_rules, sep_row=2):
        """将用户选定的规则字典导出到下拉列表，默认假设字段在第n行，在第n+1行添加规则样例行，n+2开始是下拉列表"""
        # selected_field_rules = {k: v for k, v in selected_field_rules.items() if v[1]}  # 去掉规则列表没有内容的字段

        for one_index_col, (field_name, rule_list) in selected_field_rules.items():
            if rule_list:  # 当规则列表有内容时
                dv_col, dv_beginrow = one_index_col[0], int(one_index_col[1:]) + sep_row
                sqref = f'{dv_col}{dv_beginrow}:{dv_col}1048576'  # 确保范围引用格式正确

                # 将规则列表转化为逗号分隔的字符串,并检测是否比255长，若过长即采用引用区域方式呈现。
                formula1_insides_quotes = ",".join(rule_list)
                if len(formula1_insides_quotes) > 250:
                    formula1 = self.create_or_update_dv_list(one_index_col + ":" + field_name, rule_list)
                else:
                    formula1 = f'"{formula1_insides_quotes}"'
                # 添加下拉列表及其对应区域
                dv = DataValidation(type="list", formula1=formula1, showErrorMessage=True, allow_blank=False)
                self.excel_ws.add_data_validation(dv)
                dv.add(sqref)

    def set_validation_rules_and_example(self, one_index_col, field_name, rule_list, example):
        """
        设置规则和样例到指定单元格，并且如果规则过长，只使用规则列表的前n项，
        使得len(",".join(rule_list[:n]))<20，并在后面加上"等{len(rule_list)}个选项"。
        同时设置单元格字体为红色。
        """
        # 计算合适的规则字符串长度
        rule_display = ",".join(rule_list)
        if len(rule_display) > 20:
            rule_display = ""  # 初始化规则显示字符串
            count = 0  # 记录已经拼接的字符数量
            for rule in rule_list:
                if count + len(rule) < 20:
                    if rule_display:  # 如果不是第一个规则，添加逗号
                        rule_display += ","
                    rule_display += rule
                    count += len(rule) + 1  # 加1因为逗号的长度
                else:
                    break
            rule_display += f"等{len(rule_list)}个选项"

        """# 设置单元格的值
        from openpyxl import Workbook
        from openpyxl.styles import Font, Alignment
        from openpyxl.styles.differential import DifferentialStyle
        from openpyxl.formatting.rule import Rule
        from openpyxl.styles import Color, PatternFill, Font, Border

        # 假设rule_display和example是已经定义好的变量
        rule_display = "这是规则"
        example = "这是样例"

        # 创建富文本字符串
        rich_text = openpyxl.styles.RichText()

        # 添加红色字体的片段
        red_font = Font(color="FF0000", size=7)
        rich_text.append("·规则：", red_font)
        rich_text.append(rule_display)

        # 添加换行符
        rich_text.append("\n")

        # 继续添加红色字体的片段
        rich_text.append("·样例：", red_font)
        rich_text.append(example)

        # 现在假设self.excel_ws已经指向一个Worksheet对象
        cell = self.excel_ws[f"{one_index_col[0]}{int(one_index_col[1])+1}"]

        # 将富文本字符串赋值给单元格
        cell.value = rich_text

        # 设置单元格的自动换行
        cell.alignment = Alignment(wrapText=True)"""

        cell_value = f"·规则：{rule_display}\n·样例：{example}"
        cell = self.excel_ws[f"{one_index_col[0]}{int(one_index_col[1]) + 1}"]
        cell.value = cell_value
        cell.font = Font(color="FF0000", size=7)  # 红色字体
        cell.alignment = Alignment(wrapText=True)  # 开启自动换行"""


if 1:  # 一些简单的格式转换和读取
    def convert_to_json_stream(data):
        """将Python数据类型转化为JSON格式的字符串，后端不再使用。"""
        json_string = json.dumps(data)

        # 创建一个StringIO对象，它提供了文件类的接口
        json_stream = io.StringIO(json_string)

        # 返回数据流
        return json_stream


    def read_from_json_stream(json_stream):
        """从JSON数据流中读取数据并转换为Python数据类型，后端不再使用。"""
        # 重置流的读取位置到起始处
        json_stream.seek(0)

        # 从数据流中读取JSON数据并转换为Python数据类型
        data = json.load(json_stream)

        # 返回Python数据类型
        return data


    def read_from_json_file(file_path):
        """从JSON文件中读取数据并转换为Python数据类型"""
        with open(file_path, 'r', encoding="utf-8") as json_file:
            data = json.load(json_file)
        return data


    def clear_directory(path):
        # 检查路径是否存在
        if os.path.exists(path):
            # 遍历目录中的所有内容
            for filename in os.listdir(path):
                file_path = os.path.join(path, filename)
                try:
                    # 如果是文件夹，则递归删除
                    if os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                    # 如果是文件，则删除文件
                    else:
                        os.remove(file_path)
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')

if "__main__" == __name__:
    Xio = Excel_IO()
    output = io.BytesIO()
    excel_got = r"tests\for_xls2xlsx\xls_file.xls"
    with open(excel_got, 'rb') as file:
        output.write(file.read())
    # 重置流的位置到开始处，这样就可以从头读取
    output.seek(0)
    Xio.convert_excel_format(output, "xls", "xlsx", True)
    input("xls文件已转化为xlsx文件，保存在tests/for_xls2xlsx目录下，请查看")

import io

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from services.file_rule_maker import FileRuleMaker
from io import BytesIO
from utils import excel_processor
import json

app = Flask(__name__)
CORS(app)

fuker = FileRuleMaker()


@app.route('/save_rawFile', methods=['POST'])
def save_raw_file():
    file = request.files.get("file")
    file_name = request.files.get("file").filename
    file_stream = io.BytesIO(file.read())

    if file:
        # 转换处理
        if file_name.endswith(".xls"):
            file_stream = excel_processor.Excel_IO().convert_excel_format(file_stream, "xls", "xlsx", True)

        # 给file_rule_maker 的属性赋值
        fuker.get_file_stream(file_stream, file_name)

        # 发送处理后的文件给前端
        byte_stream = io.BytesIO()
        byte_stream.write(file_stream.getvalue())
        byte_stream.seek(0)  # 跳转到流的开头
        return send_file(byte_stream,
                         mimetype='application/vnd.ms-excel',
                         as_attachment=True,
                         download_name=file_name
                         )


@app.route('/generate_user_rule_dict', methods=['POST'])
def generate_user_rule_dict():

    fields_index_col_list = json.loads(request.form.get("fields"))
    fields_index_col_dict = {field['position']: field['fieldName'] for field in fields_index_col_list}
    # print(file, file_name,fields_index_col_dict)

    if fields_index_col_dict:
        print(fields_index_col_dict)
        field_rules = fuker.generate_user_rule_dict(fields_index_col_dict)
        print('field rules: ', field_rules)
        return jsonify(field_rules)
    return "Error processing file", 500


@app.route('/create_final_rules_and_examples', methods=['POST'])
def create_final_rules_and_examples():
    selected_field_rules = json.loads(request.form.get('finalRules'))
    final_rules_and_examples, _ = fuker.create_final_rules_and_examples(selected_field_rules)

    return jsonify(final_rules_and_examples), 200


@app.route('/create_final_rules_and_examples_file', methods=['POST'])
def create_final_rules_and_examples_file():
    selected_field_rules = json.loads(request.form.get('finalRules'))
    _, simulate_rule_excel_stream = fuker.create_final_rules_and_examples(selected_field_rules)
    # 发送处理后的文件给前端
    byte_stream = io.BytesIO()
    byte_stream.write(simulate_rule_excel_stream.getvalue())
    byte_stream.seek(0)  # 跳转到流的开头

    return send_file(byte_stream,
                     mimetype='application/vnd.ms-excel',
                     as_attachment=True,
                     )


if __name__ == '__main__':
    app.run()