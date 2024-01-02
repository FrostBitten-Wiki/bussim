import re
import html
import markdown2

class PostProcessors:
    @staticmethod
    def section(match):
        level = len(match.group(1))
        title = match.group(2)

        fontSize = {1: "35px", 2: "25px", 3: "20px"}.get(level, "25px")
        return f"""
<div style="margin-top: 20px; margin-bottom: 35px;" id="{title.lower().replace(" ", "-")}">
    <text style="font-size: {fontSize};">{title}</text>
    <div style="width: 100%; height: 1px; background-color: white; margin-top: 2px; margin-bottom: 5px; box-shadow: 0 2px 0 #000000;"></div>
</div>
"""

    @staticmethod
    def tree(match):
        return "\n" + markdown2.markdown(match.group(0).strip(), extras=["markdown-in-html"]).replace("<p>", "").replace("</p>", "")

    @staticmethod
    def table(match):
        headers = match.group(1).split('|')
        aligns = match.group(2).split('|')
        rows = match.group(3).strip().split('\n')

        # Remove empty strings
        headers = list(filter(lambda x: x.strip() != '', headers))
        aligns = list(filter(lambda x: x.strip() != '', aligns))

        table_html = '<table border="1">\n<thead>\n<tr>\n'
        for i, header in enumerate(headers):
            align = 'left' if i >= len(aligns) else aligns[i].strip()
            table_html += f'<th style="text-align: {align}">{header.strip()}</th>\n'
        table_html += '</tr>\n</thead>\n<tbody>\n'

        for row in rows:
            cells = row.split('|')
            # Remove empty strings
            cells = list(filter(lambda x: x.strip() != '', cells))

            table_html += '<tr>\n'
            for i, cell in enumerate(cells):
                align = 'left' if i >= len(aligns) else aligns[i].strip()
                table_html += f'<td style="text-align: {align}">{cell.strip()}</td>\n'
            table_html += '</tr>\n'

        table_html += '</tbody>\n</table>\n'
        return table_html

    @staticmethod
    def escapeChar(char):
        return html.escape(char)

class Patterns:
    ITALIC = [r"\*(.*?)\*", r'<i>\1</i>']
    BOLD = [r"\*\*(.*?)\*\*", r'<b>\1</b>']
    LINK = [r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>']
    STRIKE = [r"~~(.*?)~~", r'<s>\1</s>']
    UNDERLINE = [r'__(.*?)__', r'<u>\1</u>']

    HTML_CHAR = [r"\\([^\s]+)", lambda match: PostProcessors.escapeChar(match.group(1))]

    SUB = [r'v\((.*?)\)', r'<sub>\1</sub>']
    SUP = [r'\^\((.*?)\)', r'<sup>\1</sup>']

    TREE = [r'^(?:\s*[-*+]\s+[^\n]*\n?)+', PostProcessors.tree]
    TABLE = [
        r'\|(.+?)\|\n\|(.+?)\|\n((?:\|.+?\|.*?(?:\n|$))+)\n?',
        PostProcessors.table
    ]
    

def render(text: str, syntaxes: dict):
    for syntaxName, (pattern, flags, replacement) in syntaxes.items():
        if flags == None: pattern = re.compile(pattern)
        else: pattern = re.compile(pattern, flags)

        text = pattern.sub(replacement, text)

    return text