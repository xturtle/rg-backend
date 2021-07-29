import messages from './error'

export default {
  result : (payload, code = "0") => {
    let message = "";
    if (code == "0")
      message = messages[0];
    else{
      const digit1 = code[0], digit2 = code[1], digit3 = code[2];
      message = messages[digit1][digit2][digit3];
    }
        
    return JSON.stringify({
      code: code,
      message: message,
      payload: payload
    }, null, 2)
  }
}