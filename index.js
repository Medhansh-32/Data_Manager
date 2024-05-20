const { faker } = require('@faker-js/faker');
const express = require("express");
const mysql = require("mysql2");

const port=8080;
const app=express();



const methodOverride=require("method-override")
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
const path=require("path");

app.set("view engine","ejs");
app.use(express.static("public"));
app.set("public",path.join(__dirname,"/public"));

app.set("views",path.join(__dirname,"/views"));
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password:'1234'
});
let  getRandomUser=() =>{
  return [
     faker.string.uuid(),
     faker.internet.userName(),
     faker.internet.email(),
     faker.internet.password(),
 
  ];
}

app.get("/",(req,res)=>{
let q="select count(*) from user";

try{
  connection.query(q,(err,result)=>{
if(err) throw err;
let count=result[0]["count(*)"];
res.render("home.ejs",{count});

});
}
catch(err){
  console.log(err);
  res.send("Some Erorr in DB")
}

});

app.get("/user",(req,res)=>{
let q1="select  id,username,email  from user";
try{
  connection.query(q1,(err,result)=>{
    if(err) throw err;
    res.render("user.ejs",{result});
  
  });
}catch(err){
  console.log("Error in DB ",err);
}

});
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where id=?`;
connection.query(q,id,(err,result)=>{
  try{
if(err) throw err;
console.log(result);
res.render("edit.ejs",{result});

  }catch(err){
    console.log(err);
  }
})

});

app.patch("/user/:id",(req,res)=>{

  let {id}=req.params;
  let q=`select * from user where id=?`;
let {password:formpass,username:newusername}=req.body;
  connection.query(q,id,(err,result)=>{
    try{
      if(err) throw err;
      console.log(result);
      if(result[0].password==formpass){ //checking password
        let q1=`update user set username= "${newusername}" where id= "${result[0].id}"`; //updating value
        connection.query(q1,(err,result)=>{
          try{
            if(err) throw err;
             console.log(result);
          connection.query(`select * from user where id="${id}"`,(err,result)=>{
            console.log(result);
           // res.send("changed Succesfully");
            setTimeout(()=>{
res.redirect("/user");
            },2000)
          });
          }catch(err){
            console.log(err);
          }
        });
      }else{
        res.send("Wrong PassWord");
      }
    }catch(err){
      console.log(err);
    }
  })
})
app.get("/user/new",(req,res)=>{
res.render("new.ejs");
});

app.post("/user/add",(req,res)=>{
let username=req.body.username;
let password=req.body.password;
let email=req.body.email;
let newid= faker.string.uuid();
  console.log(username);
  console.log(password);
  console.log(email);
  console.log(newid);

 connection.query(`insert into user values("${newid}","${username}","${email}","${password}")`,(err,result)=>{
  console.log(result);
 });

 res.send(`${username} Added Succesfully`);
})

app.get("/user/:id/confirm",(req,res)=>{
  let {id} = req.params;
  console.log(id);
  connection.query(`select * from user where id="${id}"`,(err,result)=>{
    res.render("rem.ejs",{result})
  console.log("Deleting");
});
  })


app.delete("/user/:id/remove",(req,res)=>{
  let {id}=req.params;
  console.log("i",id);
  let value=req.body.Del;
  console.log(value);
if(value=="Yes"){
  let q=`delete from user where id="${id}"`;

  connection.query(q,(err,result)=>{
   try{
    if(err) throw err;
    console.log(result);
    setTimeout(()=>{
      res.redirect("/user");
                  },2000)
   }
   catch(err){
    console.log("error in DB",err);
   }
  
  })
}else{
  res.send("Deletion Aborted");
}
  
})
  app.listen(port,()=>{
    console.log("listening on port 8080....");
  });
  