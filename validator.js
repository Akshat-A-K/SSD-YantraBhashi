class YantraBhashaValidator {
    constructor() {
        this.variable_table = {};//store declared variables and their types
        this.error_list = [];//store all validation errors
        this.block_stack = [];//stack to track blocks like loops and conditionals
        this.reserved_words = ["PADAM", "ANKHE", "VARTTAI", "ELAITHE", "ALAITHE", "MALLI-MALLI", "CHATIMPU", "CHEPPU"]; //reserved keywords not allowed as variable names
    }

    validate_code(code) {
        this.variable_table = {};
        this.error_list = [];
        this.block_stack = [];

        const raw_lines = code.split(/\r?\n/);
        let processed_lines = [];
        let line_buffer = '';
        let buffer_start_line = 0;
        let in_loop_header = false;

        //process raw code lines and group statements
        for (let i = 0; i < raw_lines.length; i++) {
            let current_line = raw_lines[i];
            if (!line_buffer) buffer_start_line = i + 1;
            if (current_line.trim() === '' || current_line.trim().startsWith('#')) continue;

            if (!in_loop_header && current_line.trim().startsWith('MALLI-MALLI(')) {
                in_loop_header = true;
            }
            line_buffer += (line_buffer ? '\n' : '') + current_line.trim();
            if (in_loop_header) {
                if (/\)\s*\[$/.test(line_buffer)) {
                    processed_lines.push({ text: line_buffer, line_num: buffer_start_line });
                    line_buffer = '';
                    in_loop_header = false;
                }
                continue;
            }

            if (/;\s*$|\[$|^]$/.test(line_buffer)) {
                processed_lines.push({ text: line_buffer, line_num: buffer_start_line });
                line_buffer = '';
            }
        }
        if (line_buffer) {
            processed_lines.push({ text: line_buffer, line_num: buffer_start_line });
        }

        let open_blocks = [];

        //validate each processed line
        for (let idx = 0; idx < processed_lines.length; idx++) {
            const raw_line = processed_lines[idx].text;
            const line_num = processed_lines[idx].line_num;
            let line = raw_line.trim();
            if (!line || line.startsWith('#')) continue;

            //closing block
            if (line === ']') {
                if (open_blocks.length === 0) {
                    this.error_list.push({ line: line_num, message: `Unmatched closing bracket ']'` });
                } else {
                    open_blocks.pop();
                }
                continue;
            }

            //opening block
            if (/\[$/.test(line)) {
                open_blocks.push({ line: line_num });
            }

            //variable declaration
            let decl_match = line.match(/^PADAM\s+(\w+)\s*:\s*(VARTTAI|ANKHE)\s*(=\s*(.+))?\s*;$/s);
            if (decl_match) {
                const var_name = decl_match[1];
                const var_type = decl_match[2];
                const var_value = decl_match[4];
                if (this.reserved_words.includes(var_name)) {
                    this.error_list.push({ line: line_num, message: `Variable name '${var_name}' is reserved.` });
                } else if (this.variable_table[var_name]) {
                    this.error_list.push({ line: line_num, message: `Variable '${var_name}' already declared.` });
                } else {
                    this.variable_table[var_name] = var_type;
                    if (typeof var_value !== 'undefined') {
                        if (!this.check_type_value(var_type, var_value.trim())) {
                            this.error_list.push({ line: line_num, message: `Invalid ${var_type === "ANKHE" ? "integer" : "string"} value for '${var_name}'.` });
                        }
                    }
                }
                continue;
            }

            //assignment statement
            let assign_match = line.match(/^(\w+)\s*=\s*(.+);$/s);
            if (assign_match) {
                const var_name = assign_match[1];
                const var_expr = assign_match[2];
                if (!this.variable_table[var_name]) {
                    this.error_list.push({ line: line_num, message: `Undeclared variable '${var_name}'.` });
                } else if (!this.check_expr_type(this.variable_table[var_name], var_expr.trim())) {
                    this.error_list.push({ line: line_num, message: `Invalid ${this.variable_table[var_name] === "ANKHE" ? "integer" : "string"} assignment to '${var_name}'.` });
                }
                continue;
            }

            //input-output statements
            let print_match = line.match(/^CHATIMPU\((.+)\);$/);
            let scan_match = line.match(/^CHEPPU\((.+)\);$/);
            if (print_match || scan_match) {
                const var_name = (print_match ? print_match[1] : scan_match[1]).trim();
                if (var_name.startsWith('"') && var_name.endsWith('"')) {
                    //string literal in print
                } else if (!this.variable_table[var_name]) {
                    this.error_list.push({ line: line_num, message: `Undeclared variable '${var_name}' in ${print_match ? "print" : "scan"}.` });
                }
                continue;
            }

            //if condition
            let if_start = line.match(/^ELAITHE\s*\((.+)\)\s*\[$/);
            if (if_start) {
                if (!this.validate_condition(if_start[1].trim(), line_num)) {
                    this.error_list.push({ line: line_num, message: `Invalid condition in ELAITHE.` });
                }
                continue;
            }

            //else block
            let else_start = line.match(/^ALAITHE\s*\[$/);
            if (else_start) {
                continue;
            }

            //loop block
            let loop_start = line.match(/^MALLI-MALLI\s*\((.+)\)\s*\[$/s);
            if (loop_start) {
                const loop_header = loop_start[1].trim();
                if (!this.validate_loop(loop_header, line_num)) {
                    this.error_list.push({ line: line_num, message: `Invalid MALLI-MALLI syntax.` });
                } else {
                    const loop_decl_match = loop_header.split(';')[0].match(/^PADAM\s+(\w+)\s*:\s*ANKHE\s*=\s*-?\d+$/);
                    if (loop_decl_match) {
                        this.variable_table[loop_decl_match[1]] = "ANKHE";
                    }
                }
                continue;
            }

            //general error checks
            if (!line.endsWith(';') && !/\[$/.test(line)) {
                this.error_list.push({ line: line_num, message: `Missing semicolon.` });
                continue;
            }

            this.error_list.push({ line: line_num, message: `Unknown or invalid statement.` });
        }

        //unclosed blocks check
        if (open_blocks.length > 0) {
            open_blocks.forEach(entry => {
                this.error_list.push({ line: entry.line, message: `Missing closing ']' for block opened here.` });
            });
        }

        return this.error_list;
    }

    //check type and value consistency
    check_type_value(type, value) {
        if (type === "ANKHE") {
            return /^-?\d+$/.test(value);
        } else {
            return /^".*"$/.test(value);
        }
    }

    //check assignment expressions
    check_expr_type(type, expr) {
        expr = expr.trim();
        if (type === "ANKHE") {
            if (/^-?\d+$/.test(expr)) return true;
            let replaced = expr.replace(/\b\w+\b/g, v => this.variable_table[v] === "ANKHE" ? "1" : v);
            return /^[\d\s\+\-\*\/\(\)]+$/.test(replaced);
        } else {
            if (/^".*"$/.test(expr)) return true;
            if (/^[a-zA-Z_]\w*$/.test(expr) && this.variable_table[expr] === "VARTTAI") return true;
            return false;
        }
    }

    //validate loop header structure
    validate_loop(header, line_num) {
        const parts = header.split(';').map(p => p.trim()).filter(Boolean);
        if (parts.length !== 3) return false;
        const decl_match = parts[0].match(/^PADAM\s+(\w+)\s*:\s*ANKHE\s*=\s*-?\d+$/);
        if (!decl_match) return false;
        const cond_match = parts[1].match(/^(\w+)\s*(==|!=|<=|>=|<|>)\s*-?\d+$/);
        if (!cond_match) return false;
        const update_match = parts[2].match(/^(\w+)\s*=\s*\1\s*\+\s*1$/);
        if (!update_match) return false;
        return true;
    }

    //validate conditions in if statements
    validate_condition(cond, line_num) {
        const match = cond.match(/^(\w+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
        if (!match) return false;
        const var_name = match[1];
        const op = match[2];
        const val = match[3];
        if (!this.variable_table[var_name]) return false;
        if (this.variable_table[var_name] === "VARTTAI" && ["<", ">", "<=", ">="].includes(op)) return false;
        if (this.variable_table[var_name] === "ANKHE" && !/^(-?\d+|\w+)$/.test(val.trim())) return false;
        return true;
    }
}

module.exports = { YantraBhashaValidator };
