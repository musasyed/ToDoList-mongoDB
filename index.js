var express = require("express");
const bodyParser=require("body-parser")
const mongoose=require("mongoose")

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
const port=3000;

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Eating"
});
const item2=new Item({
    name:"Study"
});

const defaultItems=[item1,item2];


// List Schema for Custom
const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);



// Item.insertMany(defaultItems,function(error){
//     if(error){
//         console.log(error)
//     }
//     else{
//         console.log("Successfully default Items Added")
//     }
// })



app.get("/",(req,res)=>{
    Item.find({},function(error,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(error){
    if(error){
        console.log(error)
    }
    else{
        console.log("Successfully default Items Added")
    }
})
res.redirect("/");
        }
        else{
        // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // var today  = new Date();
        res.render("index.ejs",{listTitle:"Today",listItem:foundItems}) 
        }
        console.log(foundItems)
        });
});

// app.get("/", function(req, res){
//     //Mongoose read
//     Item.find({}, function(err, results){
//       if (results.length === 0) {
//         Item.insertMany(defaultItems, function(err){
//           if (err) {
//             console.log(err);
//           } else {
//             console.log("Added succesfully.");
//           }
//         });
//         res.redirect("/");
//       } else {
//         res.render("index.ejs", {listTitle: "Today", listItems: results});
//       }
//     });
  
//   });


// Custom Adding
app.get("/:newListTab", function(req, res){
    const customListName = (req.params.newListTab);
  
    List.findOne({name: customListName}, function(err, results){
      if (err) {
        console.log(err)
      } else {
        if (!results) {
          const list = new List({name: customListName, items: defaultItems});
  
          list.save();
          res.redirect("/" + customListName);
  
        } else {
          res.render("index.ejs", {listTitle: results.name, listItem: results.items});
        }
      }
    });
  
  });



app.post("/",(req,res)=>{
const newItems=req.body.newItem;
const listName=req.body.list;
const item=new Item({
    name:newItems
})
if(listName==="Today"){
item.save()
res.redirect("/")
}else{
List.findOne({name:listName},function(error,foundItems){
    foundItems.items.push(item);
    foundItems.save();
    res.redirect("/" + listName);
})
}
})

app.post("/delete",function(req,res){
    const checkedId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndDelete(checkedId,function(error){
            if(error){
                console.log(error)
            }
            else{
                console.log("Item Deleted")
            }
        })
        res.redirect("/")
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
          if (!err) {
            res.redirect("/" + listName);
          }
        });
      }
    
})



app.listen(port,()=>{
    console.log(`Server is running at ${port}`)
})
