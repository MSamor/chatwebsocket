var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
 
app.get('/', function(req, res){
    res.send('<h1>Welcome Realtime Server</h1>');
});
 
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
var socketArr = [];
var userIdArr = {}; //存所有用户的id

io.on('connection', function(socket){
    onlineCount++;
    console.log('a user connected 链接用户数：'+ onlineCount);

    socket.on('getAll', function () //获取所有用户id码
	{
        socket.emit('getAlls',userIdArr)
    });

    socket.on('join', function()//把客户端存到全局数组里面去
	{
        userIdArr[socket.id] = socket.id
        socketArr[socket.id] = socket;
        console.log(userIdArr)
    });

    socket.on('joins', function(me)//把服务端存到全局数组里面去
	{
        socketArr[me] = socket;
        userIdArr[socket.id] = me
    });
    
    //监听用户发布聊天内容
    socket.on('msg', function(msg,to){
        //向指定客户端广播发布的消息
        if(socketArr[to]){
            socketArr[to].emit('msg',msg,userIdArr[socket.id])
        }else{
            console.log('没有此用户！')
            socket.emit('msg',{msg:'服务端未上线'},userIdArr[socket.id])
        }
    });
   
     //监听用户退出
     socket.on('disconnect', function(){
        onlineCount--;
        delete userIdArr[socket.id]
        console.log('一位用户退出了，链接用户数：'+onlineCount)
    });
});
 
http.listen(3000, function(){
    console.log('http://localhost:3000');
});