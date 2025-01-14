"""This module contains a linting function for a tool's help."""
from galaxy.util import (
    rst_to_html,
    unicodify,
)


def lint_help(tool_xml, lint_ctx):
    """Ensure tool contains exactly one valid RST help block."""
    # determine line to report for general problems with help
    root = tool_xml.getroot()
    if root is not None:
        root_line = root.sourceline
        root_path = tool_xml.getpath(root)
    else:
        root_line = 1
        root_path = None
    helps = root.findall("help")
    if len(helps) > 1:
        lint_ctx.error("More than one help section found, behavior undefined.", line=helps[1].sourceline, xpath=tool_xml.getpath(helps[1]))
        return

    if len(helps) == 0:
        lint_ctx.warn("No help section found, consider adding a help section to your tool.", line=root_line, xpath=root_path)
        return

    help = helps[0].text or ''
    if not help.strip():
        lint_ctx.warn("Help section appears to be empty.", line=helps[0].sourceline, xpath=tool_xml.getpath(helps[0]))
        return

    lint_ctx.valid("Tool contains help section.", line=helps[0].sourceline, xpath=tool_xml.getpath(helps[0]))
    invalid_rst = rst_invalid(help)

    if "TODO" in help:
        lint_ctx.warn("Help contains TODO text.", line=helps[0].sourceline, xpath=tool_xml.getpath(helps[0]))

    if invalid_rst:
        lint_ctx.warn(f"Invalid reStructuredText found in help - [{invalid_rst}].", line=helps[0].sourceline, xpath=tool_xml.getpath(helps[0]))
    else:
        lint_ctx.valid("Help contains valid reStructuredText.", line=helps[0].sourceline, xpath=tool_xml.getpath(helps[0]))


def rst_invalid(text):
    """Predicate to determine if text is invalid reStructuredText.

    Return False if the supplied text is valid reStructuredText or
    a string indicating the problem.
    """
    invalid_rst = False
    try:
        rst_to_html(text, error=True)
    except Exception as e:
        invalid_rst = unicodify(e)
    return invalid_rst
