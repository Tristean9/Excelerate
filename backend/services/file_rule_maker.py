import os, sys, io
import openpyxl as px
from openpyxl.styles import Font, Border, Side, PatternFill, Alignment, Protection
from openpyxl.utils import get_column_letter

"""用于导入项目中不在同一文件夹的库"""
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils.excel_processor as XPRO


class FileRuleMaker:
    def __init__(self):
        self.file_name = None
        self.file_rule_dict = dict()
        self.rule_choice_sepaprator = ","  # 进一步：后端存储列表类型相关内容，传给前端的是join为字符串的内容，默认以英文逗号间隔同一规则内的各个选项，可用户自定义修改

    def generate_user_rule_dict(self,
                                excel_got: io.BytesIO,
                                file_name: str,
                                fields_index_col: dict) -> io.StringIO:
        """
            从数据流接收  ：含字段的空文件+其文件名+用户选择的位置与字段值的对应字典
            输出到数据流  ：包含预定义规则和下拉列表的字典

            Parameters from stream:
                excel_got (excel_file): 含字段的内容空白的Excel文件
                file_name (str):
                    content:该Excel文件的文件名
                    format :"test.xls(x)"
                fields_index_col (dict):
                    content:所有字段的位置与字段值对应的字典
                    format :{"A1":"序号","A2":"姓名"}#进一步：考虑字段位置为合并单元格的情况
            Returns to stream:
                field_rules_for_choice (dict):
                    content:用户可选规则字典，包含预定义规则和下拉列表的字典
                    format :{"字段名1":{"对应列下拉列表规则":[["下拉规则1选项1","下拉规则1选项2"],
                                                            ["下拉规则2选项1","下拉规则2选项2"]],
                                        "程序预定义规则":   [["程序预定义规则1备注语","程序预定义规则1选项1","程序预定义规则1选项2"],
                                                            ["程序预定义规则2备注语","程序预定义规则2选项1","程序预定义规则2选项2"]]}
                            "字段名2":...同上}
        """
        # TODO:
        # 将列号与单元格、字段名匹配
        # 设定用户可选规则字典 ##转成列表，根据key排序，得到从左到右的字段的字典
        # 匹配字段名与预定义规则(调用函数)
        # 匹配下拉列表信息(调用函数)
        # 返回用户可选规则字典

        # 获取文件并转化
        Xio = XPRO.Excel_IO()
        """项目实际部署时，无需判断是否为字符串，全部为前端发送的数据流"""
        excel_wb, excel_ws = Xio.load_workbook_from_stream(excel_got) if type(
            excel_got) != str else Xio.read_excel_file(excel_got)

        # 读取对象并获取属性
        Xattr = XPRO.Excel_attribute(excel_wb, excel_ws)
        ""
        Field_row = Xattr.get_some_axis_cells(field_row_num, value_only=False)
        # return Field_row
        # 匹配字段列号与字段单元格、列表中字段名，循环结束时应得到一个字段齐全的字典
        Field_index_to_cell_name = {}
        for cell in Field_row:
            for name in fields_list:
                # print(name,cell.value,name==cell.value)
                if name == cell.value:
                    Field_index_to_cell_name[(get_column_letter(cell.column))] = [cell, name]
                    continue
        # return Field_index_to_cell_name
        # 设定用户可选规则字典 注：Python 3.6之后，字典是有序的
        Sheet_dropdowns = Xattr.get_dropdowns()
        Field_rules = {name: dict(zip(["对应列下拉列表规则", "程序预定义规则"],
                                      [Sheet_dropdowns[col_index] if col_index in Sheet_dropdowns else [],
                                       ["syz随便写的程序预设规则1", "syz随便写的程序预设规则2"]])) for
                       col_index, (cell, name) in Field_index_to_cell_name.items()}
        for j, k in Field_rules.items():
            print("*", j, k)

        OUTPUT = XPRO.convert_to_json_stream(Field_rules)
        return OUTPUT

    def create_final_rules_and_examples(self, selected_field_rules) -> io.StringIO:
        """
            从数据流接收  ：字段名与规则对应的字典
            输出到数据流  ：字段名与最终规则和样例对应的字典，含有最终规则和样例行、最终规则下拉列表的Excel文件

            Parameters from stream:
                selected_field_rules (dict_saved_in_json_stream):
                    content:用户确定后的规则字典
                    format :{"字段位置1":["字段名1",["最终规则选项1","最终规则选项1"],
                            "字段位置2":["字段名2",["最终规则选项1","最终规则选项1"],
                            "字段位置3":同上...}


            Returns to stream:
                final_rules_and_examples (dict):
                    content:字段名与最终规则和样例对应的字典
                    format :{"字段位置1":["字段名1",["最终规则正则表达式","最终规则样例"]]
                            "字段位置2":...同上}
                simulate_rule_excel (excel_file):含有字段行、最终规则和样例行、最终规则下拉列表的Excel文件
        """

        pass  # TODO: 实现方法

    def save_final_rules(self, excel_saving_mode: io.StringIO, files_saving_path: io.StringIO):
        """
            从数据流接收  ：excel文件保存模式，excel文件和规则文件保存路径
            本地操作      ：保存excel文件和规则文件到指定目录#进一步：考虑 excel文件和规则文件 打包到一起的zip 到指定目录
            输出到数据流  ：文件保存成功提示
            Parameters from stream:
                excel_saving_mode (str):
                    content:excel文件保存模式,值为数字+“-”+数字
                    format :"0-0";(表示不对文件内容做修改)
                            "1-1";(表示在文件的字段下一行添加规则&样例行)
                            "1-2";(表示在文件除了表头的位置，均根据规则添加下拉列表)
                            "2-2";(表示同时添加规则&样例行和下拉列表)

            Returns to stream:
                recall_info (boolean):
                    content:是否完成保存
                    format :True/False
        """
        pass  # TODO: 实现方法


if "__main__" == __name__:
    Fuker = FileRuleMaker()
    excel_got = r"../tests/for_fuker.extract/test1.xlsx"
    # 测试第一个方法
    """
    print(Fuker.extract_fields_from_excel(excel_got))"""

    # 测试第二个方法
    fields_list = ['序号', '作品题目', '参赛类别', '作品学科分类', '学科门类', '一级学科', '作者', '是否为团队负责人',
                   '性别', '生源地', '学号', '所在院系', '年级（如2020级本科生/硕士生/博士生）', '手机', '微信号', '邮箱',
                   '指导教师姓名', '指导教师性别', '指导教师所在院系', '指导教师职称/职务', '指导教师电话',
                   '指导教师电子邮箱']
    excel_got = r"..\tests\for_fuker.extract\test2_dropdown.xlsx"
    (Fuker.generate_user_rule_dict(excel_got, fields_list, field_row_num=5))