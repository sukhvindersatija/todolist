//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemSchema={
    name:String
};
const Item=mongoose.model("Item",itemSchema);

const listSchema={
  name:String,
  item:[itemSchema]
};
const List=mongoose.model("List",listSchema);

const buyFood=new Item({
  name:"Buy Food"
});
const cookFood=new Item({
  name:"Cook Food"
});
const eatFood=new Item({
  name:"Eat Food"
});


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      const defaultItems=[buyFood,cookFood,eatFood]
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Sucess!");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });


});

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundItems){
      if(!err){
        if(!foundItems){
          const list=new List({
            name:customListName,
            item:[]
          });
          list.save();
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle: customListName, newListItems: foundItems.item});
        }
      }
    })

});

app.post("/", function(req, res){
  const listTitle=req.body.list
  const itemName = req.body.newItem;
  const addItem=new Item({
    name:itemName,
  });
  if(listTitle==="Today"){
    addItem.save();
    res.redirect("/");
  }
  else{
      List.findOne({name:listTitle},function(err,foundItems){
        foundItems.item.push(addItem);
        foundItems.save();

      });
      res.redirect("/"+listTitle);

  }

});
app.post("/delete",function(req,res){
  const listTitle=req.body.hiddenInput;
  if(listTitle==="Today"){
    Item.deleteOne({_id:req.body.checkbox},function(err){
      if(err){
        console.log("error while deleting");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listTitle},{$pull:{item:{_id:req.body.checkbox}}},function(err,foundLists){
      if(!err){
        res.redirect("/"+listTitle);
      }

    });
  }

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
