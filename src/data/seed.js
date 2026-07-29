const SEED = {
  farms:[
    {id:1,name:"Green Valley Maize",crop:"maize",state:"kaduna",location:"Zaria, Kaduna",goal:500000,funded:325000,shares:10000,sold:6500,roi:25,timeline:12,icon:"🌽"},
    {id:2,name:"Sunrise Rice Farm",crop:"rice",state:"kano",location:"Kura, Kano",goal:750000,funded:600000,shares:15000,sold:12000,roi:30,timeline:10,icon:"🌾"},
    {id:3,name:"Golden Cassava Fields",crop:"cassava",state:"benue",location:"Makurdi, Benue",goal:400000,funded:150000,shares:8000,sold:3000,roi:20,timeline:12,icon:"🥔"},
    {id:4,name:"Fresh Tomato Haven",crop:"tomatoes",state:"ogun",location:"Abeokuta, Ogun",goal:300000,funded:280000,shares:6000,sold:5600,roi:28,timeline:8,icon:"🍅"},
  ],
  produce:[
    {id:1,name:"Premium Maize",cat:"grains",price:50,qty:1000,unit:"kg",seller:"Green Valley Farm",state:"Kaduna",lga:"Zaria",desc:"Freshly harvested, sun-dried premium maize. Certified organic.",icon:"🌽"},
    {id:2,name:"Parboiled White Rice",cat:"grains",price:80,qty:500,unit:"kg",seller:"Sunrise Farm",state:"Kano",lga:"Kura",desc:"Stone-free processed rice. High-grade, kitchen-ready.",icon:"🌾"},
    {id:3,name:"Roma Tomatoes",cat:"vegetables",price:30,qty:200,unit:"kg",seller:"Fresh Haven",state:"Ogun",lga:"Abeokuta",desc:"Bright red, farm-fresh. Harvested and dispatched same day.",icon:"🍅"},
    {id:4,name:"Cassava Tubers",cat:"tubers",price:40,qty:800,unit:"kg",seller:"Golden Fields",state:"Benue",lga:"Makurdi",desc:"Large fresh cassava — ideal for garri, flour, or fufu.",icon:"🥔"},
    {id:5,name:"Yellow Sweet Yam",cat:"tubers",price:55,qty:400,unit:"kg",seller:"Plateau Best",state:"Plateau",lga:"Jos",desc:"Premium-grade yam, uniform sizing, export-ready.",icon:"🍠"},
  ],
  equipment:[
    {id:1,name:"John Deere 5E Tractor",cat:"machinery",price:5000000,qty:1,unit:"unit",seller:"AgriTech Ltd",state:"Lagos",lga:"Ikeja",desc:"2022 model 75HP diesel tractor. Under 200 hours.",icon:"🚜"},
    {id:2,name:"Solar Water Pump",cat:"irrigation",price:150000,qty:5,unit:"unit",seller:"Irrigation Pro",state:"Kaduna",lga:"Kaduna North",desc:"Off-grid solar pump 2HP, covers 8ha. Zero running cost.",icon:"💧"},
    {id:3,name:"Steel Grain Silo 50T",cat:"storage",price:800000,qty:2,unit:"unit",seller:"Storage Solutions",state:"Kano",lga:"Kano Municipal",desc:"Galvanised steel silo with ventilation and moisture control.",icon:"🏗️"},
    {id:4,name:"Pro Harvesting Toolkit",cat:"tools",price:25000,qty:20,unit:"set",seller:"Farm Tools Inc",state:"Plateau",lga:"Jos North",desc:"18-piece set: sickles, hooks, cutters, gloves, baskets.",icon:"🔧"},
  ],
  supplies:[
    {id:1,name:"NPK 20-10-10 Fertilizer",cat:"fertilizer",price:15000,qty:100,unit:"bag",seller:"FertilizeCo",state:"Lagos",lga:"Apapa",desc:"Compound fertilizer with micronutrients. NAFDAC certified.",icon:"🌱"},
    {id:2,name:"DK8031 Hybrid Maize Seeds",cat:"seeds",price:8000,qty:50,unit:"bag",seller:"Premium Seeds",state:"Kaduna",lga:"Zaria",desc:"Drought-tolerant hybrid. 95% germination. 140-day variety.",icon:"🌽"},
    {id:3,name:"Cypermethrin 200EC",cat:"pesticides",price:12000,qty:30,unit:"liter",seller:"BioProtect",state:"Ogun",lga:"Abeokuta",desc:"Broad-spectrum insecticide. NAFDAC approved.",icon:"🛡️"},
    {id:4,name:"Broiler Starter Feed",cat:"feed",price:6500,qty:200,unit:"bag",seller:"Feed Masters",state:"Oyo",lga:"Ibadan",desc:"21% protein complete feed for 0–4 week broilers.",icon:"🐔"},
  ],
  labor:[
    {id:1,name:"Planting Crew (10)",type:"planting",rate:5000,workers:10,duration:"5 days",state:"Kaduna",lga:"Zaria",desc:"Experienced row-crop planting team. Own tools.",icon:"👨‍🌾"},
    {id:2,name:"Harvesting Team (15)",type:"harvesting",rate:8000,workers:15,duration:"7 days",state:"Kano",lga:"Kano Municipal",desc:"Large harvesting crew with modern equipment.",icon:"🌾"},
    {id:3,name:"Maintenance Squad (5)",type:"maintenance",rate:4000,workers:5,duration:"3 days",state:"Benue",lga:"Makurdi",desc:"Weeding, pruning, pest scouting, irrigation checks.",icon:"🔨"},
    {id:4,name:"Processing Workers (8)",type:"processing",rate:6000,workers:8,duration:"10 days",state:"Plateau",lga:"Jos North",desc:"Crop sorting, cleaning, grading and packaging specialists.",icon:"⚙️"},
  ],
  users:{
    "chidi-okafor":{id:"chidi-okafor",name:"Chidi Okafor",initials:"CO",role:"Maize Farmer · Kaduna",bio:"Third-generation maize farmer in Zaria. Running a 40-hectare precision irrigation operation funded through Infinite Sprouts. Sharing what works, what fails, and the numbers behind it.",followers:1840,following:212,joined:"Mar 2024"},
    "amaka-eze":{id:"amaka-eze",name:"Amaka Eze",initials:"AE",role:"AgriTech Researcher",bio:"PhD candidate researching soil sensor networks for smallholder farms. Published in three journals. Trying to make precision agriculture affordable for everyone, not just big farms.",followers:3210,following:88,joined:"Jan 2023"},
    "musa-abdullahi":{id:"musa-abdullahi",name:"Musa Abdullahi",initials:"MA",role:"Rice Farmer · Kano",bio:"Rice farmer expanding operations in Kura. Always hiring, always learning. DM me about irrigation tech or labor partnerships.",followers:960,following:340,joined:"Jun 2024"},
    "you":{id:"you",name:"Your Name",initials:"YO",role:"Farmer and Investor · Nigeria",bio:"Smallholder farmer and agricultural investor focused on maize, rice, and tomato production across Northern and Southern Nigeria.",followers:140,following:64,joined:"Feb 2024"},
  },
  posts:[
    {id:1,authorId:"chidi-okafor",author:"Chidi Okafor",initials:"CO",role:"Maize Farmer · Kaduna",time:"2h",body:"Just wrapped our first IST-funded harvest on Green Valley. 340% yield improvement vs last season. Precision drip irrigation changed everything 🧵",image:"🌽",tags:["Maize","Irrigation","YieldBoost"],likes:142,comments:3,shares:24,communityId:null},
    {id:2,authorId:"amaka-eze",author:"Amaka Eze",initials:"AE",role:"AgriTech Researcher",time:"5h",body:"New paper out: soil sensor networks reduce fertilizer waste by 41% on smallholder farms in Benue. NPK decisions 3 weeks earlier saves ₦8,400/hectare.",tags:["Research","SoilHealth","Sensors"],likes:89,comments:2,shares:31,communityId:null},
    {id:3,authorId:"musa-abdullahi",author:"Musa Abdullahi",initials:"MA",role:"Rice Farmer · Kano",time:"1d",body:"Hiring 2 irrigation technicians for our 15ha rice expansion in Kura. IST payment, housing provided, 3-month contract. DM or apply via platform.",tags:["Jobs","Rice","Kano"],likes:57,comments:2,shares:12,communityId:null},
    {id:4,authorId:"chidi-okafor",author:"Chidi Okafor",initials:"CO",role:"Maize Farmer · Kaduna",time:"3h",body:"Season update from Green Valley — maize stand count looking healthy at 52,000 plants per hectare. Targeting 8 tonnes this cycle. #Maize #Kaduna",tags:["Maize","Kaduna"],likes:61,comments:1,shares:8,communityId:1},
    {id:5,authorId:"amaka-eze",author:"Amaka Eze",initials:"AE",role:"AgriTech Researcher",time:"6h",body:"Sensor deployment complete on 3 trial farms in Benue. Real-time soil moisture data coming in. This changes how we do fertilizer timing forever. #SoilHealth #AgriTech",tags:["SoilHealth","AgriTech"],likes:104,comments:2,shares:19,communityId:3},
    {id:6,authorId:"musa-abdullahi",author:"Musa Abdullahi",initials:"MA",role:"Rice Farmer · Kano",time:"2d",body:"Kura expansion paddy fields are flooded and ready for transplanting. 15 hectares this season. #Rice #Kano",tags:["Rice","Kano"],likes:38,comments:2,shares:5,communityId:2},
  ],
  comments:{
    1:[
      {id:101,authorId:"amaka-eze",text:"340% is huge — was that yield by weight or by hectare? Would love to see the soil data behind this.",time:"1h",likes:12,replies:[
        {id:1011,authorId:"chidi-okafor",text:"By hectare. Happy to share the NPK schedule if it helps your research.",time:"45m",likes:5},
      ]},
      {id:102,authorId:"musa-abdullahi",text:"Which drip system did you go with? Looking at something similar for the rice expansion.",time:"40m",likes:3,replies:[]},
      {id:103,authorId:"you",text:"This is inspiring. Following your farm closely.",time:"20m",likes:1,replies:[]},
    ],
    2:[
      {id:201,authorId:"chidi-okafor",text:"Bookmarking this. Soil sensors have been on my list for next season.",time:"3h",likes:8,replies:[]},
      {id:202,authorId:"musa-abdullahi",text:"Does this work for paddy rice fields or mainly dry-land crops?",time:"2h",likes:2,replies:[
        {id:2021,authorId:"amaka-eze",text:"Tested mainly on maize and cassava so far, but the moisture sensors should generalize to paddy. Planning a rice-specific trial next quarter.",time:"1h",likes:4},
      ]},
    ],
    3:[
      {id:301,authorId:"you",text:"Sent you a DM about the housing arrangement.",time:"18h",likes:0,replies:[]},
      {id:302,authorId:"chidi-okafor",text:"Good luck with the expansion, Musa.",time:"10h",likes:2,replies:[]},
    ],
    4:[
      {id:401,authorId:"amaka-eze",text:"52,000 plants per hectare is excellent density for maize. What's your inter-row spacing?",time:"2h",likes:6,replies:[]},
    ],
    5:[
      {id:501,authorId:"chidi-okafor",text:"Can't wait to see the trial results. Have you compared with traditional timing yet?",time:"4h",likes:9,replies:[
        {id:5011,authorId:"amaka-eze",text:"Not yet — that's phase two. Baseline data collection first.",time:"3h",likes:3},
      ]},
    ],
    6:[
      {id:601,authorId:"you",text:"Best of luck with the transplanting season, Musa!",time:"1d",likes:1,replies:[]},
      {id:602,authorId:"chidi-okafor",text:"15 hectares is no small feat. Rooting for you.",time:"20h",likes:4,replies:[]},
    ],
  },
  communities:[
    {id:1,name:"Nigerian Maize Growers",ico:"🌽",bg:"linear-gradient(135deg,#1a4a1a,#267326)",members:1240,posts:340,notif:true,count:5,followed:true,desc:"For maize farmers across Nigeria sharing yield data, irrigation techniques, and market timing strategies."},
    {id:2,name:"Rice Farmers Association",ico:"🌾",bg:"linear-gradient(135deg,#0c2a0c,#1e5a1e)",members:870,posts:210,notif:false,count:2,followed:false,desc:"Rice farmers from Kano to Kebbi discussing paddy management, processing, and labor coordination."},
    {id:3,name:"AgriTech Innovators",ico:"🤖",bg:"linear-gradient(135deg,#163d3d,#14b8a6)",members:3400,posts:890,notif:true,count:12,followed:true,desc:"Researchers and farmers exploring sensors, satellite imagery, and smart contracts in agriculture."},
    {id:4,name:"Women in Farming",ico:"👩‍🌾",bg:"linear-gradient(135deg,#3d0a3d,#a855f7)",members:2100,posts:540,notif:false,count:0,followed:false,desc:"A community for women farmers and investors to network, mentor, and grow together."},
  ],
  conversations:[
    {id:1,name:"Chidi Okafor",initials:"CO",preview:"The maize yield report is ready",time:"2m",unread:3,messages:[
      {id:1,me:false,text:"Hello! I saw your investment in Green Valley.",time:"10:30"},
      {id:2,me:true,text:"Yes! Looking forward to the harvest season.",time:"10:32"},
      {id:3,me:false,text:"The maize yield report is ready for review.",time:"10:45"},
    ]},
    {id:2,name:"Amaka Eze",initials:"AE",preview:"Can we schedule a call this week?",time:"1h",unread:1,messages:[
      {id:1,me:false,text:"Hi! I would love to discuss the soil sensor project.",time:"9:00"},
      {id:2,me:true,text:"Absolutely, what is your availability?",time:"9:10"},
      {id:3,me:false,text:"Can we schedule a call this week?",time:"9:15"},
    ]},
    {id:3,name:"Sprouts Support",initials:"SS",preview:"Your wallet is verified",time:"3h",unread:0,messages:[
      {id:1,me:false,text:"Welcome to Infinite Sprouts! Your account is fully activated.",time:"8:00"},
      {id:2,me:false,text:"Your wallet is verified. You can now invest and transact.",time:"8:01"},
    ]},
  ],
  transactions:[
    {id:1,type:"in",title:"Farm Return — Green Valley",sub:"Q3 Harvest Dividend",amount:"+12,500 IST",date:"Today, 9:14am",wallet:"ist"},
    {id:2,type:"out",title:"NPK Fertilizer Purchase",sub:"Farm Supplies · FertilizeCo",amount:"−15,000 IST",date:"Yesterday",wallet:"ist"},
    {id:3,type:"in",title:"OPay Transfer Received",sub:"From Adaeze O.",amount:"+₦50,000",date:"Jun 4",wallet:"naira"},
    {id:4,type:"out",title:"Harvesting Crew Hire",sub:"Labor · Kano Municipal",amount:"−8,000 IST",date:"Jun 3",wallet:"ist"},
    {id:5,type:"out",title:"OPay Transfer Sent",sub:"To Musa A.",amount:"−₦20,000",date:"Jun 2",wallet:"naira"},
    {id:6,type:"in",title:"IST Token Purchase",sub:"Platform Top-Up",amount:"+5,000 IST",date:"Jun 1",wallet:"ist"},
  ],
};

export default SEED;
