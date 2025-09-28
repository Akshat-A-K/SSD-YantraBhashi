export class SubmissionService {

    constructor() {
        this.variable_table = {};
        this.error_list = [];
        this.block_stack = [];
        this.reserved_words = ["PADAM", "ANKHE", "VARTTAI", "ELAITHE", "ALAITHE", "MALLI-MALLI", "CHATIMPU", "CHEPPU"]; 
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

        for (let i = 0; i < raw_lines.length; i++) {
            let current_line = raw_lines[i];
            if (!line_buffer) buffer_start_line = i + 1;
            if (current_line.trim() === '' || current_line.trim().startsWith('#')) continue;

            // Remove inline comments from the line
            let processed_line = current_line.replace(/#.*$/, '').trim();
            if (!processed_line) continue;

            line_buffer += (line_buffer ? '\n' : '') + processed_line;
            
            // Check if we're entering a loop header (can be anywhere in the line buffer)
            if (!in_loop_header && /MALLI-MALLI\s*\(/.test(line_buffer)) {
                in_loop_header = true;
            }
            
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

        for (let idx = 0; idx < processed_lines.length; idx++) {
            const raw_line = processed_lines[idx].text;
            const line_num = processed_lines[idx].line_num;
            let line = raw_line.trim();
            line = line.replace(/\s+/g, ' ');
            
            const comment_index = line.indexOf('#');
            if (comment_index !== -1) {
                line = line.substring(0, comment_index).trim();
            }
            
            if (!line) continue;

            if (line.startsWith(']')) {
                if (open_blocks.length === 0) {
                    this.error_list.push({ line: line_num, message: `Unmatched closing bracket ']'` });
                } else {
                    open_blocks.pop();
                }
                
                let remaining = line.substring(1).trim();
                if (remaining.match(/^ALAITHE\s*\[$/)) {
                    open_blocks.push({ line: line_num, type: 'ALAITHE' });
                    continue;
                } else if (remaining.match(/^ALAITHE\s*;\s*\[$/)) {
                    this.error_list.push({ line: line_num, message: `Invalid syntax: Remove semicolon between '] ALAITHE' and '['.` });
                    continue;
                } else if (remaining.match(/^;\s*ALAITHE\s*\[$/)) {
                    this.error_list.push({ line: line_num, message: `Invalid syntax: Remove semicolon between ']' and 'ALAITHE'.` });
                    continue;
                } else if (remaining) {
                    line = remaining;
                } else {
                    continue;
                }
            }

            if (/\[$/.test(line) && !line.match(/^]\s*ALAITHE\s*\[$/)) {
                open_blocks.push({ line: line_num });
            }

            let decl_match = line.match(/^PADAM\s+(\w+)\s*:\s*(VARTTAI|ANKHE)\s*(=\s*([^;]+))?\s*;+/s);
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
                            this.error_list.push({ line: line_num, message: `Invalid ${var_type === "ANKHE" ? "integer" : "string"} value for '${var_name}'. Expected ${var_type === "ANKHE" ? "integer" : "string in quotes"}.` });
                        }
                    }
                }
                // Remove the matched declaration from the line and continue processing the rest
                line = line.replace(/^PADAM\s+(\w+)\s*:\s*(VARTTAI|ANKHE)\s*(=\s*([^;]+))?\s*;\s*/s, '').trim();
                if (!line) continue;
            }

            // Check for invalid PADAM syntax (missing semicolon)
            if (line.match(/^PADAM\s+(\w+)\s*:\s*(VARTTAI|ANKHE)(\s*(=\s*([^;]+)))?$/s)) {
                this.error_list.push({ line: line_num, message: `Missing semicolon in variable declaration.` });
                continue;
            }

            let assign_match = line.match(/^(\w+)\s*=\s*([^;]+)\s*;/s);
            if (assign_match) {
                const var_name = assign_match[1];
                const var_expr = assign_match[2];
                
                if (!this.variable_table[var_name]) {
                    this.error_list.push({ line: line_num, message: `Undeclared variable '${var_name}'.` });
                } else {
                    const expected_type = this.variable_table[var_name];
                    if (!this.check_expr_type(expected_type, var_expr.trim())) {
                        this.error_list.push({ line: line_num, message: `Type mismatch: Cannot assign ${this.get_expression_type_description(var_expr)} to ${expected_type === "ANKHE" ? "integer" : "string"} variable '${var_name}'.` });
                    }
                }
                // Remove the matched assignment from the line and continue processing the rest
                line = line.replace(/^(\w+)\s*=\s*([^;]+)\s*;\s*/s, '').trim();
                if (!line) continue;
            }

            let print_match = line.match(/^CHATIMPU\s*\(\s*(.*?)\s*\)\s*;+/s);
            let scan_match = line.match(/^CHEPPU\s*\(\s*(.*?)\s*\)\s*;+/s);
            if (print_match || scan_match) {
                const var_name = (print_match ? print_match[1] : scan_match[1]).trim();
                if (var_name.startsWith('"') && var_name.endsWith('"')) {
                    //string literal in print
                } else if (!this.variable_table[var_name]) {
                    this.error_list.push({ line: line_num, message: `Undeclared variable '${var_name}' in ${print_match ? "print" : "scan"}.` });
                }
                // Remove the matched statement from the line and continue processing the rest
                line = line.replace(/^(CHATIMPU|CHEPPU)\s*\(\s*.*?\s*\)\s*;+\s*/s, '').trim();
                if (!line) continue;
            }

            let if_start = line.match(/^ELAITHE\s*\((.+)\)\s*\[$/);
            if (if_start) {
                continue;
            }

            let else_start = line.match(/^ALAITHE\s*\[$/);
            if (else_start) {
                continue;
            }

            // Check for invalid ALAITHE syntax (with semicolon)
            if (line.match(/^ALAITHE\s*;\s*\[$/)) {
                this.error_list.push({ line: line_num, message: `Invalid ALAITHE syntax. Remove semicolon before '['.` });
                continue;
            }

            let loop_start = line.match(/^MALLI-MALLI\s*\((.+)\)\s*\[$/s);
            if (loop_start) {
                const loop_header = loop_start[1].trim();
                
                if (!this.validate_loop(loop_header, line_num)) {
                    this.error_list.push({ line: line_num, message: `Invalid MALLI-MALLI syntax.` });
                    continue;
                }

                const loop_decl_match = loop_header.split(';')[0].match(/^PADAM\s+(\w+)\s*:\s*ANKHE\s*=\s*-?\d+$/);
                if (loop_decl_match) {
                    const loop_var = loop_decl_match[1];
                    if (this.variable_table[loop_var]) {
                        this.variable_table[loop_var] = "ANKHE";
                    } else {
                        this.variable_table[loop_var] = "ANKHE";
                    }
                }
                continue;
            }

            if (!line.endsWith(';') && !/\[$/.test(line) && !line.match(/^]\s*ALAITHE\s*\[$/)) {
                this.error_list.push({ line: line_num, message: `Missing semicolon.` });
                continue;
            }

            if (!line.match(/^PADAM|^ELAITHE|^ALAITHE|^MALLI-MALLI|^CHATIMPU|^CHEPPU|^\w+\s*=|^\]|.*\[$/)) {
                this.error_list.push({ line: line_num, message: `Unknown or invalid statement.` });
            }
        }

        if (open_blocks.length > 0) {
            open_blocks.forEach(entry => {
                this.error_list.push({ line: entry.line, message: `Missing closing ']' for block opened here.` });
            });
        }

        return this.error_list;
    }

    check_type_value(type, value) {
        value = value.trim();
        if (type === "ANKHE") {
            return /^-?\d+$/.test(value);
        } else if (type === "VARTTAI") {
            return /^".*"$/.test(value);
        }
        return false;
    }

    check_expr_type(expected_type, expr) {
        expr = expr.trim();
        
        if (expected_type === "ANKHE") {
            return this.is_valid_integer_expression(expr);
        } else if (expected_type === "VARTTAI") {
            return this.is_valid_string_expression(expr);
        }
        return false;
    }

    is_valid_integer_expression(expr) {
        if (/^-?\d+$/.test(expr)) {
            return true;
        }
        
        if (/^\w+$/.test(expr)) {
            return this.variable_table[expr] === "ANKHE";
        }
        
        if (expr.includes('"') || /^".*"$/.test(expr)) {
            return false;
        }
        
        let test_expr = expr;
        const variables = expr.match(/\b[a-zA-Z_]\w*\b/g) || [];
        
        for (const variable of variables) {
            if (!this.variable_table[variable] || this.variable_table[variable] !== "ANKHE") {
                return false;
            }
            test_expr = test_expr.replace(new RegExp('\\b' + variable + '\\b', 'g'), '1');
        }
        
        if (!/^[\d\s\+\-\*\/\(\)]+$/.test(test_expr)) {
            return false;
        }
        
        try {
            eval(test_expr);
            return true;
        } catch (e) {
            return false;
        }
    }

    is_valid_string_expression(expr) {
        if (/^".*"$/.test(expr)) {
            return true;
        }
        
        if (/^\w+$/.test(expr)) {
            return this.variable_table[expr] === "VARTTAI";
        }
        
        return false;
    }

    get_expression_type_description(expr) {
        expr = expr.trim();
        
        if (/^-?\d+$/.test(expr)) {
            return "integer literal";
        }
        
        if (/^".*"$/.test(expr)) {
            return "string literal";
        }
        
        if (/^\w+$/.test(expr)) {
            if (this.variable_table[expr]) {
                return `${this.variable_table[expr] === "ANKHE" ? "integer" : "string"} variable`;
            } else {
                return "undeclared variable";
            }
        }
        
        if (expr.includes('"')) {
            return "mixed string and arithmetic expression";
        }
        
        if (/[\+\-\*\/]/.test(expr)) {
            return "arithmetic expression";
        }
        
        return "invalid expression";
    }

    validate_loop(header, line_num) {
        // Remove all newlines and normalize whitespace
        const normalized_header = header.replace(/\s+/g, ' ').trim();
        
        if (normalized_header.includes(';;')) {
            return false;
        }
        
        const parts = normalized_header.split(';');
        
        if (parts.length !== 3) {
            return false;
        }
        
        const decl_part = parts[0].trim();
        const cond_part = parts[1].trim();
        const update_part = parts[2].trim();
        
        if (!decl_part || !cond_part || !update_part) {
            return false;
        }
        
        const decl_match = decl_part.match(/^PADAM\s+(\w+)\s*:\s*ANKHE\s*=\s*-?\d+$/);
        if (!decl_match) return false;
        
        const loop_var = decl_match[1];
        
        const cond_match = cond_part.match(/^(\w+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
        if (!cond_match) return false;
        
        if (cond_match[1] !== loop_var) return false;
        
        const update_match = update_part.match(/^(\w+)\s*=\s*\1\s*\+\s*1$/);
        if (!update_match) return false;
        
        if (update_match[1] !== loop_var) return false;
        
        return true;
    }

    validate_condition(cond, line_num) {
        const match = cond.match(/^(\w+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
        if (!match) return false;
        const var_name = match[1];
        const op = match[2];
        const val = match[3].trim();
        
        if (this.variable_table[var_name] === "VARTTAI") {
            if (["<", ">", "<=", ">="].includes(op)) return false;
            if (!/^".*"$/.test(val) && (!this.variable_table[val] || this.variable_table[val] !== "VARTTAI")) {
                return false;
            }
        } else if (this.variable_table[var_name] === "ANKHE") {
            if (!/^-?\d+$/.test(val) && (!this.variable_table[val] || this.variable_table[val] !== "ANKHE")) {
                return false;
            }
        } else {
            return true;
        }
        
        return true;
    }
}