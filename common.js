let msgCacheTimeout = 1000 * 60; // in ms

let cityDetails = {
'douala_CM' : {'name':'Douala, Cameroon','apiKey':'suBk7gkCIJgFH1xDCcTgmHtoearWLRnlPIna4nexmrESfKVTUDRw'},
'douala2_CM' : {'name':'Douala, Cameroon','apiKey':'suBk7gkCIJgFH1xDCcTgmHtoearWLRnlPIna4nexmrESfKVTUDRw'},
'yaounde_CM' : {'name':'Yaounde, Cameroon','apiKey':'Jn44oxamUfb2TRZaTwJzqPpkK3phv5NRG67T2zZBerER5madV7tW6g'},
'ngaoundere_CM' : {'name':'Ngaoundere, Cameroon','apiKey':'5bJNwiV45DubJlSk23cmLNcXFkiB7pbb56O0c6QzxCo6jG82Dh8kg'},
'garoua_CM' : {'name':'Garoua, Cameroon','apiKey':'qQE81Vc90EGUURNQBkYhlEWA0Th4K0NMmIUSaypbEzrimi1OqqzUA'},
'maroua_CM' : {'name':'Maroua, Cameroon','apiKey':'pAkwFx04sSGi2HLZPIAMHXbpx9wJkHLj1rU7kL5WZXu4lfTTw50zg'},
'bertoua_CM' : {'name':'Bertoua, Cameroon','apiKey':'hIMFolseW4RgNQvDPPTPCxbRcTAEvXJWu60tPncnQkDTEKOrTeA'},
'bafoussam_CM' : {'name':'Bafoussam, Cameroon','apiKey':'MgFkoyYEdI8iWXZEEATXAwS4QUXwrCYh85BLI4lhNXMRjYOXxhg'},
'bamenda_CM' : {'name':'Bamenda, Cameroon','apiKey':'eVRQKGyxXY7V0XnJuXBx4eVv1lpbC7sS9pSTz70BUmeTnYUPBFkKQ'},
'buea_CM' : {'name':'Buea, Cameroon','apiKey':'Rr5G0l5zirbwVWHEMIIwSkp9MjPL2bX1qOfDNP6keVI3UV64WzrzZA'},
'ebolowa_CM' : {'name':'Ebolowa, Cameroon','apiKey':'xBpx4kOTtS2AU2G6IOfQkgo3RdZwWC1TokXKbP2u5NkqjgXPCd4gww'},
'kribi_CM' : {'name':'Kribi, Cameroon','apiKey':'h72PkQAOeXZSWdQ2oSlRNoBCrKRsQ63DIJVM7JT84w2mGdI8HZEVQ'},
'mbalmayo_CM' : {'name':'Mbalmayo, Cameroon','apiKey':'DQWsSbyF0MGB6Bm0c5Oisp1EQbpShd97BvtaOgV4wrjCGcfa3gXAQ'},
'kamsar_GN' : {'name':'Kamsar, Guinea','apiKey':'GxCEcRwdamI6qHMifjqC8z0HdCgUVl8LeMv01efsoL7FSyiEH0sA'},
'mekelle_ET' : {'name':'Mekelle, Ethiopia','apiKey':'NudkI5doQsUBBHoWSgROhlWFmW9bTALpuS5omAafqflQtCWR4wzw'},
'pemba_MZ' : {'name':'Pemba, Mozambique','apiKey':'6umc88Sa53nFgMDq02g7o83PiiNoCy7W3uy3tuRKbUaOQGKAiig'},
'port-harcourt_NG' : {'name':'Port Harcourt, Nigeria','apiKey':'AKh70CyrS4UDr6g71JjAV3y1Ibkvz16dAwCcOsJqZygS0Z10IFwT8g'},
'ahafo_GH' : {'name':'Ahafo, Ghana','apiKey':'5JwWxBbS4PRs8Yc2zz1aW6U8nnZH3nNoHkpqLmllDyPt3uemuNQ'},
'philadelphia_US' : {'name':'Philadelphia, US','apiKey':'W5BMlgVf4fe46FXTeSG8ElMSgVSlGsYbb6F0v6mUNgIx6qL1awJpuw'}
};

let countryCityMap = {
    "CM" : {"name" : "Cameroon", "cities" : ["bafoussam_CM", "bamenda_CM", "bertoua_CM", "buea_CM", "douala_CM", "ebolowa_CM", "garoua_CM", "maroua_CM", "mbalmayo_CM", "ngaoundere_CM", "kribi_CM", "yaounde_CM"]},
    "GN" : {"name" : "Guinea", "cities" : ["kamsar_GN"]},
    "ET" : {"name" : "Ethiopia", "cities" : ["mekelle_ET"]},
    "MZ" : {"name" : "Mozambique", "cities" : ["pemba_MZ"]},
    "NG" : {"name" : "Nigeria", "cities" : ["port-harcourt_NG"]},
    "GH" : {"name" : "Ghana", "cities" : ["ahafo_GH"]},
    "US" : {"name" : "United States", "cities" : ["philadelphia_US"]}
};

let langLocaleMap = {
    "en" : "en-US",
    "fr" : "fr-FR"
};

let categorListObj = {
'1':{'displayName':'Communication','key':'communication'},
'2':{'displayName':'Education','key':'education'},
'3':{'displayName':'Shelter & Services','key':'emergency'},
'4':{'displayName':'Health & Medical','key':'health_medical'},
'5':{'displayName':'Water & Sanitation','key':'water_sanitation'},
'6':{'displayName':'Road Network','key':'road_network'},
'7':{'displayName':'Energy','key':'energy'},
'8':{'displayName':'Religious','key':'religious'},
'9':{'displayName':'Open Space','key':'open_space'},
'10':{'displayName':'Solid Waste','key':'solid_waste'},
'11':{'displayName':'Shopping','key':'shopping'},
'12':{'displayName':'Government','key':'government'},
'13':{'displayName':'Public Safety','key':'public_safety'},
'14':{'displayName':'Transportation','key':'transportation'}
};


// establishment types for all categories
let establishmentTypeObj = {
    'communication' : [{'displayName' : 'Cell Tower', 'value' : 'cell_tower'},
                       {'displayName' : 'Phone Equipment', 'value' : 'phone_equipment'},
                       {'displayName' : 'Radio Antenna', 'value' : 'radio_antenna'}
                      ],
    'education' : [{'displayName' : 'College Or University', 'value' : 'college'},
                   {'displayName' : 'Elementary School', 'value' : 'elementary_school'},
                   {'displayName' : 'High School', 'value' : 'high_school'},
                   {'displayName' : 'Middle School', 'value' : 'middle_school'},
                   {'displayName' : 'Preschool', 'value' : 'preschool'},
                   {'displayName' : 'School', 'value' : 'school'}
                  ],

    'emergency' : [{'displayName' : 'Animal Shelter', 'value' : 'animal_shelter'},
                   {'displayName' : 'Emergency Shelter', 'value' : 'emergency_shelter'}
                  ],
    'health_medical' : [{'displayName' : 'Dentist', 'value' : 'dentist'},
                       {'displayName' : 'Diagnostic Lab', 'value' : 'diagnostic_lab'},
                       {'displayName' : 'Hospital', 'value' : 'hospital'},
                       {'displayName' : 'Medical Clinic', 'value' : 'medical_clinic'},
                       {'displayName' : 'Pharmacy', 'value' : 'pharmacy'},
                       {'displayName' : 'Physician', 'value' : 'physician'},
                       {'displayName' : 'Veterinary Care', 'value' : 'vet'}
                       ],
    'water_sanitation' : [{'displayName' : 'Fire Hydrant', 'value' : 'fire_hydrant'},
                          {'displayName' : 'Public Toilet', 'value' : 'public_toilet'},
                          {'displayName' : 'Reservoir', 'value' : 'reservoir'},
                          {'displayName' : 'Sewage Treatment Plant', 'value' : 'stp'},
                          {'displayName' : 'Water Tank', 'value' : 'water_tank'},
                          {'displayName' : 'Water Well/Borewell', 'value' : 'borewell'}
                      ],
    'road_network' : [{'displayName' : 'Gas Station', 'value' : 'gas_station'},
                      {'displayName' : 'Parking', 'value' : 'parking'}
                     ],
    'energy' : [{'displayName' : 'Transformer Substation', 'value' : 'transformer'}
               ],
    'religious' : [{'displayName' : 'Buddhist Temple', 'value' : 'buddhist_temple'},
                   {'displayName' : 'Church', 'value' : 'church'},
                   {'displayName' : 'Hindu Temple', 'value' : 'hindu_temple'},
                   {'displayName' : 'Mosque', 'value' : 'mosque'},
                   {'displayName' : 'Synagogue', 'value' : 'synagogue'}
                  ],
    'open_space' : [{'displayName' : 'Beach', 'value' : 'beach'},
                    {'displayName' : 'Campground', 'value' : 'campground'},
                    {'displayName' : 'Cemetery', 'value' : 'cemetery'},
                    {'displayName' : 'City Square', 'value' : 'city_square'},
                    {'displayName' : 'Park', 'value' : 'park'},
                    {'displayName' : 'Play Ground', 'value' : 'playground'},
                    {'displayName' : 'Stadium or Arena', 'value' : 'stadium'},
                    {'displayName' : 'Zoo', 'value' : 'zoo'}
                   ],
    'solid_waste' : [{'displayName' : 'Garbage Container', 'value' : 'garbage_container'},
                     {'displayName' : 'Recycling Center', 'value' : 'recycling_center'},
                     {'displayName' : 'Waste Treatment Plant', 'value' : 'waste__plant'}
                    ],
    'shopping' : [{'displayName' : 'Bank', 'value' : 'bank'},
                  {'displayName' : 'Shopping Center', 'value' : 'shopping_center'}
                 ],
    'government' : [{'displayName' : 'Court', 'value' : 'court'},
                    {'displayName' : 'Library', 'value' : 'library'},
                    {'displayName' : 'Museum', 'value' : 'museum'},
                    {'displayName' : 'Office', 'value' : 'office'},
                    {'displayName' : 'Post Office', 'value' : 'postoffice'},
                    {'displayName' : 'Prison', 'value' : 'prison'}
                   ],
    'public_safety' : [{'displayName' : 'Police Station', 'value' : 'police_station'},
                       {'displayName' : 'Fire Station', 'value' : 'fire_station'}
                      ],
    'transportation' : [{'displayName' : 'Airport', 'value' : 'airport'},
                   {'displayName' : 'Bus Station', 'value' : 'bus_station'},
                   {'displayName' : 'Ferry Stop', 'value' : 'ferry_stop'},
                   {'displayName' : 'Subway Station', 'value' : 'subway_station'},
                   {'displayName' : 'Taxi Stand', 'value' : 'taxi_stand'},
                   {'displayName' : 'Train Station', 'value' : 'train_station'}
                  ]
};

let GLOBAL_categories = {
    default: {
        title: "",
        icon: "crosshairs",
        color: "#000000",
        bgclass: "bg-dark",
        textclass: "text-black-50"
    },
    communication: {
        title: "Communication",
        icon: "satellite-dish",
        color: "#ff4444",
        bgclass: "danger-color",
        textclass: "text-danger-color",
        types: {
            cell_tower: {
                title: "Cell Tower",
                icon: "broadcast-tower"
            },
            phone_equipment: {
                title: "Phone Equipment",
                icon: "phone-rotary"
            },
            radio_antenna: {
                title: "Radio Antenna",
                icon: "signal-stream"
            },
            mobile_pos: {
                title: "Mobile POS",
                icon: "mobile"
            }
        }
    },
    education: {
        title: "Education",
        icon: "school",
        color: "#ffbb33",
        bgclass: "warning-color",
        textclass: "text-warning-color",
        types: {
            college: {
                title: "College or University",
                icon: "landmark"
            },
            elementary_school: {
                title: "Elementary School",
                icon: "school"
            },
            high_school: {
                title: "High School",
                icon: "landmark"
            },
            middle_school: {
                title: "Middle School",
                icon: "university"
            },
            preschool: {
                title: "PreSchool",
                icon: "child"
            },
            school: {
                title: "School",
                icon: "school"
            }
        }
    },
    emergency: {
        title: "Shelter and Services",
        icon: "house",
        color: "#2BBBAD",
        bgclass: "default-color",
        textclass: "text-default-color",
        types: {
            animal_shelter: {
                title: "Animal Shelter",
                icon: "paw"
            },
            emergency_shelter: {
                title: "Emergency Shelter",
                icon: "house-damage"
            }
        }
    },
    health_medical: {
        title: "Health & Medical",
        icon: "procedures",
        color: "#4285F4",
        bgclass: "primary-color",
        textclass: "text-primary-color",
        types: {
            diagnostic_lab: {
                title: "Diagnostic Lab",
                icon: "vials"
            },
            hospital: {
                title: "Hospital",
                icon: "ambulance"
            },
            medical_clinic: {
                title: "Medical Clinic",
                icon: "ambulance"
            },
            pharmacy: {
                title: "Pharmacy",
                icon: "clinic-medical"
            },
            physician: {
                title: "Physician",
                icon: "user-md"
            },
            vet: {
                title: "Veterinary Care",
                icon: "dog"
            }
        }
    },
    water_sanitation: {
        title: "Water & Sanitation",
        icon: "faucet-drip",
        color: "#aa66cc",
        bgclass: "secondary-color",
        textclass: "text-secondary-color",
        types: {
            fire_hydrant: {
                title: "Fire Hydrant",
                icon: "fire-extinguisher"
            },
            public_toilet: {
                title: "Public Toilet",
                icon: "toilet"
            },
            reservoir: {
                title: "Reservoir",
                icon: "water"
            },
            stp: {
                title: "Sewage Treatment Plant",
                icon: "water-lower"
            },
            water_tank: {
                title: "Water Tank",
                icon: "water-rise"
            },
            borewell: {
                title: "Water Well / Borewell",
                icon: "water-lower"
            }
        }
    },
    road_network: {
        title: "Road Network",
        icon: "road",
        color: "#ff9800",
        bgclass: "orange",
        textclass: "text-orange",
        types: {
            gas_station: {
                title: "Gas Station",
                icon: "gas-pump"
            },
            parking: {
                title: "Parking Facility",
                icon: "parking"
            }
        }
    },
    energy: {
        title: "Energy",
        icon: "atom",
        color: "#45526e",
        bgclass: "mdb-color",
        textclass: "text-mdb-color",
        types: {
            transformer: {
                title: "Transformer Substation",
                icon: "battery-bolt"
            }
        }
    },
    religious: {
        title: "Religious",
        icon: "place-of-worship",
        color: "#cddc39",
        bgclass: "lime",
        textclass: "text-lime",
        types: {
            buddhist_temple: {
                title: "Buddhist Temple",
                icon: "pray"
            },
            church: {
                title: "Church",
                icon: "church"
            },
            hindu_temple: {
                title: "Hindu Temple",
                icon: "gopuram"
            },
            mosque: {
                title: "Mosque",
                icon: "mosque"
            },
            synagogue: {
                title: "Synagogue",
                icon: "synagogue"
            }
        }
    },
    open_space: {
        title: "Open Space",
        icon: "globe-africa",
        color: "#e91e63",
        bgclass: "pink",
        textclass: "text-pink",
        types: {
            beach: {
                title: "Beach",
                icon: "umbrella-beach"
            },
            campground: {
                title: "Campground",
                icon: "campground"
            },
            cemetery: {
                title: "Cemetery",
                icon: "tombstone"
            },
            city_square: {
                title: "City Square",
                icon: "monument"
            },
            park: {
                title: "Park",
                icon: "trees"
            },
            playground: {
                title: "Play Ground",
                icon: "futbol"
            },
            stadium: {
                title: "Stadium or Arena",
                icon: "baseball"
            },
            zoo: {
                title: "Zoo",
                icon: "elephant"
            }
        }
    },
    solid_waste: {
        title: "Solid Waste",
        icon: "dumpster",
        color: "#8bc34a",
        bgclass: "light-green",
        textclass: "text-light-green",
        types: {
            garbage_container: {
                title: "Garbage Container",
                icon: "dumpster"
            },
            recycling_center: {
                title: "Recycling Center",
                icon: "recycle"
            },
            waste_plant: {
                title: "Waste Treatment Plant",
                icon: "construction"
            }
        }
    },
    shopping: {
        title: "Shopping",
        icon: "shopping-cart",
        color: "#00bcd4",
        bgclass: "cyan",
        textclass: "text-cyan",
        types: {
            bank: {
                title: "Bank",
                icon: "money-check-edit-alt"
            },
            shopping_center: {
                title: "Shopping Center",
                icon: "shopping-cart"
            }
        }
    },
    government: {
        title: "Government",
        icon: "university",
        color: "#3f51b5",
        bgclass: "indigo",
        textclass: "text-indigo",
        types: {
            court: {
                title: "Court",
                icon: "landmark-alt"
            },
            library: {
                title: "Library",
                icon: "books"
            },
            museum: {
                title: "Museum",
                icon: "vihara"
            },
            office: {
                title: "Office",
                icon: "car-building"
            },
            postoffice: {
                title: "Post Office",
                icon: "mailbox"
            },
            prison: {
                title: "Prison",
                icon: "dungeon"
            }
        }
    },
    public_safety: {
        title: "Public Safety",
        icon: "users",
        color: "#ffc107",
        bgclass: "amber",
        textclass: "text-amber",
        types: {
            police_station: {
                title: "Police Station",
                icon: "building"
            },
            fire_station: {
                title: "Fire Station",
                icon: "building"
            }
        }
    },
    transportation: {
        title: "Transportation",
        icon: "bus",
        color: "#ff5722",
        bgclass: "deep-orange",
        textclass: "text-deep-orange",
        types: {
            airport: {
                title: "Airport",
                icon: "plane-alt"
            },
            bus_station: {
                title: "Bus Station",
                icon: "bus"
            },
            ferry_stop: {
                title: "Ferry Stop",
                icon: "ship"
            },
            subway_station: {
                title: "Subway Station",
                icon: "subway"
            },
            taxi_stand: {
                title: "Taxi Stand",
                icon: "taxi"
            },
            train_station: {
                title: "Train Station",
                icon: "train"
            }
        }
    }
};

console.log("Saved User City " + localStorage.getItem('userCity'));
console.log("Saved User Lang " + localStorage.getItem('userLang'));
let userLang = localStorage.getItem('userLang') ? localStorage.getItem('userLang') : 'en';
let userCountry = localStorage.getItem('userCountry') ? localStorage.getItem('userCountry') : 'CM';
let userCity = localStorage.getItem('userCity') ? localStorage.getItem('userCity') : 'douala_CM';
console.log("userCity " + userCity);
let cityApiKey = cityDetails[userCity]['apiKey'];
if(!cityApiKey){
    userCity = 'douala_CM';
    cityApiKey = cityDetails[userCity]['apiKey'];
    localStorage.setItem('userCity', userCity);
}
console.log("cityApiKey " + cityApiKey);

let lastMsgFetchTimeStampKey = userCity + 'lastMsgFetchTimeStamp';
let currentMaxMsgIndexKey = userCity + 'currentMaxMsgIndex';
let maxMsgIndexKey = userCity + 'maxMsgIndex';
let newMsgCountKey = userCity + 'newMsgCount';
let msgDataKey = userCity + 'msgData';
let userSelCategoriesKey = userCity + 'userSelCategories';


let newLocationEstNameKey = userCity + 'new-location-est-name';
let newLocationEstTypeKey = userCity + 'new-location-est-type';
let newLocationEstDescKey = userCity + 'new-location-est-desc';
let newLocationPhotoImageKey = userCity + 'new-location-photo-image';
let newLocationPhotoImageExtKey = userCity + 'new-location-photo-image-ext';
let newLocationSelCategoryIdKey = userCity + 'new-location-sel-category-id';


let newLocationUserLatKey = userCity + 'new-location-user-lat';
let newLocationUserLngKey = userCity + 'new-location-user-lng';
let newLocationUserAltiKey = userCity + 'new-location-user-alti';
let newLocationUserAccuracyKey = userCity + 'new-location-user-accuracy';

let defaultCategory = categorListObj['8']['key'];
console.log("defaultCategory " + defaultCategory);

let cityData = {};
let cityApps = {};
let cityAirport = {};
let cityCenter = {};
let cityFeatures = {};
let cityName  = {};
let cityTransit = 0;
/* Sample City Data
cityData = {"name":"Douala, Cameroon","cityCenter":{"lat":4.061536,"lng":9.786072},"airport":{"lat":4.003499986,"lng":9.71833046},"apps":{"Flood":1,"Garbage":1,"Blood":0},"features":{"transit":0}}
*/
function populateCityDetails(data){
    cityData = data;
    cityApps = data.apps;
    cityAirport = data.airport;
    cityCenter = data.cityCenter;
    cityFeatures = data.features;
    cityTransit = cityFeatures.transit;
    cityName = data.name;

    console.log("cityApps " + JSON.stringify(cityApps));
    console.log("cityAirport " + JSON.stringify(cityAirport));
    console.log("cityCenter " + JSON.stringify(cityCenter));
    console.log("cityFeatures " + JSON.stringify(cityFeatures));
    console.log("cityTransit " + cityTransit);
    console.log("cityName " + cityName);

}

function getCityData(){
    return new Promise(function(resolve, reject){
        var url = 'https://hawkaidata.net/api/smartcity.php?key=' + cityApiKey;
        var r = $.post(url, {'cmd': 'info'},
        function (data, textStatus, jqXHR){
            resolve(data);
        }).fail(function(jqXHR, textStatus, errorThrown){
            reject(errorThrown);
        });
    });
}
function hexToRgba(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
let cityDataPromise = getCityData();
cityDataPromise.then(function(data){
    populateCityDetails(data);
}).catch(function(error){
    console.log(error);
});
