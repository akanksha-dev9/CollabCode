
function transform(op1, op2){

    if(op1.type == 'insert' && op2.type == 'insert'){
        if(op1.position < op2.position)
            return op1;
        else{
            const op = {...op1};
            op.position = op.position + op2.text.length;
            return op;
        }
    }
    if(op1.type == 'insert' && op2.type == 'delete'){
        if(op1.position <= op2.position)
            return op1;
        else{
            const op = {...op1};
            op.position = Math.max(0, op.position - op2.length);
            return op;
        }
    }
    if(op1.type == 'delete' && op2.type == 'insert'){
        if(op1.position < op2.position)
            return op1;
        else{
            const op = {...op1};
            op.position = op.position + op2.text.length;
            return op;
        }
    }
    if(op1.type == 'delete' && op2.type == 'delete'){
        if(op1.position < op2.position)
            return op1;
        else if(op1.position > op2.position){
            const op = {...op1};
            op.position = Math.max(0, op.position - op2.length);
            return op;
        }
        else return null;
    }

}

function applyOperation(content, op){

    if(op.type == 'insert'){
        return content.slice(0, op.position) + op.text + content.slice(op.position);
    }
    else if(op.type =='delete'){
        return content.slice(0, op.position) + content.slice(op.position + op.length);
    }
    return content;
}

module.exports = {transform, applyOperation};