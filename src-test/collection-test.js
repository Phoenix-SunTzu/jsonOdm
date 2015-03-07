"use strict";

var CollectionTest = TestCase("CollectionTest");

var testSource = {
        "testCollection":[
            {name:"Mustermann"},
            {name:"Musterfrau"}
        ],
        "parentCollection":[
            {
                onOfALotId:300,
                keys:[1,2,3,4],
                childCollection:[
                    {id:1},{id:2},{id:3},
                ]
            }
        ],
        "foreignCollection":[
            {id:1,foreignName:"Mustermann"},
            {id:2,foreignName:"Musterfrau"}
        ],
        "aLot":[]
    };
for(var i = 0; i < 10000; i++){
    testSource.aLot.push({
        id:i,name:'Richi'+i
    })
}
jsonOdm.addSource("test",testSource,true);

CollectionTest.prototype.testArrayInheritance = function () {
    var collection = new jsonOdm.Collection("testCollection");
    assertEquals("LengthTest1",2,collection.length);
    collection[0] = {name:"Mustermann-1"};
    collection[1] = {name:"Mustermann-2"};
    collection[2] = {name:"Mustermann-3"};
    collection.push({name:"Mustermann-4"});
    assertEquals("LengthTest2",4,collection.length);
    assertEquals("ContentTest","Mustermann-2",collection[1].name);
};

CollectionTest.prototype.testCollectionDecoration = function () {
   var collection = new jsonOdm.Collection("parentCollection");
    assertNotUndefined("Should be decorated",collection.$hasMany);
    assertFunction("Should be a function",collection.$hasMany);
    assertFunction("Should be a function",collection.$branch(0,'childCollection').$hasMany);

    collection.$hasMany("keys","id","foreignCollection","foreignKeys");
    collection.$hasOne("onOfALotId","id","aLot","onOfALot");
    assertEquals("Should have collection extended",2,collection[0].foreignKeys.length);
    assertEquals("Should have collection extended",collection[0].onOfALotId,collection[0].onOfALot.id);
};

CollectionTest.prototype.testSimpleQuery = function () {
    var collection = new jsonOdm.Collection("testCollection");
    assertEquals("Simple Query","Mustermann",collection.$query().$branch("name").$eq("Mustermann").$first().name);
    assertEquals("Simple Query","Musterfrau",collection.$query().$branch("name").$eq("Musterfrau").$all()[0].name);

    collection = new jsonOdm.Collection("aLot");
    assertEquals("Simple Query","Richi400",collection.$query().$branch("name").$eq("Richi199","Richi400").$all()[1].name);
    var q = collection.$query();
    var subCollection = q.$or(
        q.$branch("name").$eq("Richi400"),
        q.$branch("name").$eq("Richi199")
    ).$all();
    assertEquals("Should have 2 sub entries",2,subCollection.length);
    assertEquals("The first one should be Richi199",199,subCollection[0].id);
    assertEquals("The second one should be Richi400",400,subCollection[1].id);

    q = collection.$query();
    subCollection = q.$and(
        q.$branch("name").$eq("Richi401"),
        q.$branch("id").$eq(401)
    ).$all();
    assertEquals("Should have 1 entry",1,subCollection.length);
    assertEquals("The first one should be Richi401",401,subCollection[0].id);

    q = collection.$query();
    subCollection = q.$or(
        q.$and(
            q.$branch("name").$eq("Richi401"),
            q.$branch("id").$eq(401)
        ),
        q.$and(
            q.$branch("name").$eq("Richi1002"),
            q.$branch("id").$eq(1002)
        )
    ).$all();
    assertEquals("Should have 2 sub entries",2,subCollection.length);
    assertEquals("The first one should be Richi401",401,subCollection[0].id);
    assertEquals("The second one should be Richi1002",1002,subCollection[1].id);
};