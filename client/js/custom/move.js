class Move {

  static init() {
    this.izq_der = 0;
    this.arr_aba = 0;
  }

  static direction(socket, direction){
    alert(direction);
    switch (direction) {
      case "left" :
        socket.emit('direction', { direction: Move.left() });
        break;
      case "up" :
        socket.emit('direction', { direction: Move.up() });
        break;
      case "right" :
        socket.emit('direction', { direction: Move.right() });
        break;
      case "down" :
        socket.emit('direction', { direction: Move.down() });
        break;
    }

  }

  static left(){
    console.log("LEFT");
    this.izq_der= this.izq_der-10;
    return "L"+this.izq_der+"\n";//izq_der
  }

  static right(){
    console.log("RIGHT");
    this.izq_der=this.izq_der+10;
    return "R"+this.izq_der+"\n";//izq_der
  }

  static up(){
    console.log("UP");
    this.arr_aba=this.arr_aba+10;
    return "U"+this.arr_aba+"\n";//arr_aba
  }

  static down(){
    console.log("DOWN");
    this.arr_aba=this.arr_aba-10;
    return "D"+this.arr_aba+"\n";//arr_aba
  }

}
