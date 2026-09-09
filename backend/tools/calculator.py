import ast
import math
import operator

# Allowed binary operators
BIN_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

# Allowed unary operators
UNARY_OPS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

# Allowed safe functions
SAFE_FUNCS = {
    "abs": abs,
    "round": round,
    "sqrt": math.sqrt,
    "pow": math.pow,
}

def _eval_node(node):
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)
    
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant type: {type(node.value)}")

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in BIN_OPS:
            raise ValueError(f"Unsupported operator: {op_type.__name__}")
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        return BIN_OPS[op_type](left, right)

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in UNARY_OPS:
            raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
        operand = _eval_node(node.operand)
        return UNARY_OPS[op_type](operand)

    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id in SAFE_FUNCS:
            func = SAFE_FUNCS[node.func.id]
            args = [_eval_node(arg) for arg in node.args]
            return func(*args)
        raise ValueError("Unsupported function call")

    raise ValueError(f"Unsupported AST expression node: {type(node).__name__}")


def evaluate_expression(expression: str) -> dict:
    """
    Safely evaluates a mathematical expression without using eval().
    Returns dict: {"success": bool, "expression": str, "result": float | int | None, "error": str | None}
    """
    cleaned = expression.strip().replace(",", "").rstrip("=? ")
    try:
        parsed = ast.parse(cleaned, mode="eval")
        result = _eval_node(parsed)
        # Format neatly if whole number
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        return {"success": True, "expression": cleaned, "result": result, "error": None}
    except Exception as e:
        return {"success": False, "expression": cleaned, "result": None, "error": str(e)}
