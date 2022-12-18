//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");



const app = express();
// let items=["Buy Food", "cook food", "eat food"];
// let workItems=[];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-bhaskar:ajaq4kpAWcEkdwNB@cluster0.mbnofp2.mongodb.net/todolistDB',  {useNewUrlParser: true});
// todolistDB
mongoose.set('strictQuery', false);


//schema
const itemSchema = {
  name:String
}
//model
const Item=mongoose.model("Item",itemSchema);

const item1 =new Item({
name:"Welcome to todolist."
});

const item2 =new Item({
  name:"Hit the + to add new item."
  });
  const item3 =new Item({
    name:"<---Hit the delete item."
    });

    const defaultItems=[item1,item2,item3];

 const listSchema={
  name:String,
  items:[itemSchema]
 };

 const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {




  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved item to database");
        }
      })
    res.redirect("/");
     }else{
      res.render("list", {listTitle: "Today",  newListItems:foundItems});

     }


  });


});


app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      // console.log("Doesn't exit");
      const list=new List({
        name:customListName,
        items:defaultItems
      })
      list.save();
res.redirect("/"+customListName);
    }else{
      // console.log("Exists"); 
      res.render("list",{listTitle: foundList.name,  newListItems: foundList.items})
    }
  }
});
  const list=new List({
  name:customListName,
  items:defaultItems
})
list.save();
});

app.post("/", function(req, res){
  const itemName= req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
if(listName==="Today"){

  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}



});

app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
const listName=req.body.listName;

// console.log(checkedItemId);
if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted checked item.");
      res.redirect("/");
  
    }
  });
  
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
if(!err){
  res.redirect("/"+listName);
}

  })


}


});


app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
res.render("about");

});

app.post("/work",  function(req, res){
let item=req.body.newItem;
workItems.push(item);
res.redirect("/work");

});




app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000.");
});
