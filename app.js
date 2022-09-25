//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

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



app.post("/", function(req, res){
  const listTitle=req.body.list
  const itemName = req.body.newItem;
  const addItem=new Item({
    name:itemName,
  });
    addItem.save();
    res.redirect("/");

});
app.post("/delete",function(req,res){
  const listTitle=req.body.hiddenInput;
  
    Item.deleteOne({_id:req.body.checkbox}).then(res=>{
      console.log("deleted");
    }).catch(err=>{
      console.log("error while deleting");
    });
    res.redirect("/");
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.zbups.mongodb.net/?retryWrites=true&w=majority`).then(res=>{
  app.listen(process.env.PORT||3000).then(res=> {
    console.log("Server started on port 3000");
  }).catch(err=>{
    console.log(err);
  })
});

