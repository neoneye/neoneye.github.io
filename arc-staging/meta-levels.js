// Based on by ARC-Game by Alexey Borsky (volotat)
// https://github.com/volotat/ARC-Game
const META_ARC_LEVELS = {
  "entry": [
    "bb43febb",
    "6f8cd79b",
    "a79310a0",
    "ed36ccf7",
    "66e6c45b",
    "b1948b0a",
    "3aa6fb7a",
    "d037b0a7",
    "0b17323b",
    "fc754716",
    "4258a5f9",
    "aabf363d",
    "e7dd8335",
    "4f537728",
    "e7639916",
    "54d82841",
    "6d75e8bb",
    "a65b410d",
    "a699fb00",
    "5207a7b5",
    "3bdb4ada",
    "60b61512",
    "ea786f4a",
    "25ff71a9"
  ],
  "easy": [
    "aedd82e4",
    "28e73c20",
    "694f12f3",
    "d364b489",
    "1e0a9b12",
    "9565186b",
    "29c11459",
    "67a3c6ac",
    "272f95fa",
    "3618c87e",
    "759f3fd3",
    "0d3d703e",
    "74dd1130",
    "6c434453",
    "a5f85a15",
    "2281f1f4",
    "67385a82",
    "97999447",
    "b6afb2da",
    "dc1df850",
    "8fbca751",
    "32597951",
    "99fa7670",
    "c8f0f002",
    "ba26e723",
    "b548a754",
    "9dfd6313",
    "c7d4e6ad",
    "7f4411dc",
    "ba97ae07",
    "e9afcf9a",
    "bdad9b1f",
    "56ff96f3",
    "63613498",
    "a85d4709",
    "17cae0c1",
    "8d510a79",
    "25d8a9c8",
    "6150a2bd",
    "beb8660c",
    "a1570a43",
    "913fb3ed",
    "f25ffba3",
    "8e5a5113",
    "a48eeaf7",
    "137f0df0",
    "ef26cbf6",
    "9f27f097",
    "ea32f347",
    "21f83797",
    "62b74c02",
    "0962bcdd",
    "f76d97a5",
    "d37a1ef5",
    "ddf7fa4f",
    "e76a88a6",
    "e8593010",
    "952a094c",
    "351d6448",
    "b7fb29bc",
    "db3e9e38",
    "5168d44c",
    "7b6016b9",
    "32e9702f",
    "e179c5f4",
    "b27ca6d3",
    "516b51b7",
    "810b9b61",
    "f8c80d96",
    "94414823",
    "e26a3af2",
    "d406998b",
    "0ca9ddb6",
    "760b3cac",
    "b60334d2",
    "4e469f39",
    "917bccba",
    "b8cdaf2b",
    "496994bd",
    "7ddcd7ec",
    "a3df8b1e",
    "af902bf9",
    "98cf29f8",
    "782b5218",
    "7e0986d6",
    "e88171ec",
    "e5062a87",
    "ef135b50",
    "623ea044",
    "11852cab",
    "22168020",
    "7447852a",
    "928ad970",
    "d6ad076f",
    "d89b689b",
    "05f2a901",
    "9772c176",
    "642248e4",
    "551d5bf1",
    "332efdb3",
    "c3f564a4",
    "ec883f72",
    "aba27056",
    "1f876c06",
    "4093f84a",
    "a406ac07",
    "6e02f1e3",
    "3c9b0459",
    "41e4d17e",
    "6e19193c",
    "d511f180",
    "e21d9049",
    "705a3229",
    "bd4472b8",
    "d8c310e9",
    "8403a5d5",
    "c9f8e694",
    "84f2aca1",
    "292dd178",
    "639f5a19",
    "d4f3cd78",
    "56dc2b01",
    "4347f46a",
    "941d9a10",
    "25d487eb",
    "543a7ed5",
    "228f6490",
    "50cb2852",
    "5c0a986e",
    "5582e5ca",
    "e9c9d9a1",
    "3345333e",
    "3ac3eb23",
    "3bd67248",
    "2bcee788",
    "45737921",
    "23581191",
    "00d62c1b",
    "29623171",
    "e9ac8c9e",
    "08ed6ac7",
    "1bfc4729",
    "178fcbfb",
    "22eb0ac0",
    "67a423a3",
    "95990924",
    "d5d6de2d",
    "dc433765",
    "b7249182"
  ],
  "intermediate": [
    "4c4377d9",
    "a3f84088",
    "5b526a93",
    "ba9d41b8",
    "2dee498d",
    "4be741c5",
    "0e206a2e",
    "445eab21",
    "321b1fc6",
    "27a28665",
    "29ec7d0e",
    "4612dd53",
    "2dc579da",
    "a61f2674",
    "42918530",
    "444801d8",
    "0dfd9992",
    "7df24a62",
    "1c02dbbe",
    "1c786137",
    "68b67ca3",
    "ff72ca3e",
    "692cd3b6",
    "e40b9e2f",
    "c62e2108",
    "a3325580",
    "67b4a34d",
    "54d9e175",
    "dc0a314f",
    "e509e548",
    "bc1d5164",
    "d13f3404",
    "e6721834",
    "fcb5c309",
    "9c1e755f",
    "2f0c5170",
    "5bd6f4ac",
    "f1cefba8",
    "253bf280",
    "d23f8c26",
    "e4075551",
    "c8cbb738",
    "7ee1c6ea",
    "140c817e",
    "93b581b8",
    "ce22a75a",
    "20818e16",
    "4364c1c4",
    "e48d4e1a",
    "48131b3c",
    "20981f0e",
    "ac2e8ecf",
    "890034e9",
    "fafd9572",
    "81c0276b",
    "695367ec",
    "9ecd008a",
    "f83cb3f6",
    "b7cb93ac",
    "d56f2372",
    "447fd412",
    "f4081712",
    "b15fca0b",
    "64a7c07e",
    "9caba7c3",
    "50a16a69",
    "d492a647",
    "7d18a6fb",
    "0a2355a6",
    "845d6e51",
    "4b6b68e5",
    "aa18de87",
    "72322fa7",
    "bc4146bd",
    "ff805c23",
    "ecdecbb3",
    "ac3e2b04",
    "868de0fa",
    "c6e1b8da",
    "ded97339",
    "e2092e0c",
    "13713586",
    "42a50994",
    "c1990cce",
    "cfb2ce5a",
    "ed98d772",
    "3a301edc",
    "8731374e",
    "2546ccf6",
    "d017b73f",
    "5ffb2104",
    "baf41dbf",
    "c48954c1",
    "d687bc17",
    "6cf79266",
    "963f59bc",
    "9bebae7a",
    "8dae5dfc",
    "f0afb749",
    "00dbd492",
    "045e512c",
    "72207abc",
    "72a961c9",
    "6e82a1ae",
    "97239e3d",
    "d90796e8",
    "45bbe264",
    "7d1f7ee8",
    "85c4e7cd",
    "60a26a3e",
    "0c786b71",
    "6cdd2623",
    "6ecd11f4",
    "ae3edfdc",
    "e0fb7511",
    "8cb8642d",
    "5af49b42",
    "8a371977",
    "d282b262",
    "4290ef0e",
    "604001fa",
    "ce9e57f2",
    "9def23fe",
    "6aa20dc0",
    "2b01abd0",
    "a8d7556c",
    "88a10436",
    "f5b8619d",
    "47c1f68c",
    "0b148d64",
    "e57337a4",
    "f823c43c",
    "46442a0e",
    "49d1d64f",
    "60c09cac",
    "1cf80156",
    "da2b0fe3",
    "8be77c9e",
    "6d0aefbc",
    "c59eb873",
    "1a2e2828",
    "1990f7a8",
    "e633a9e5",
    "e7a25a18",
    "23b5c85d",
    "ce8d95cc",
    "bf699163",
    "a416b8f3",
    "73182012",
  ],
  "medium": [
    "eb281b96",
    "c97c0139",
    "46f33fce",
    "f45f5ca7",
    "9a4bb226",
    "cf133acc",
    "31aa019c",
    "d2acf2cb",
    "12eac192",
    "696d4842",
    "5783df64",
    "e98196ab",
    "5daaa586",
    "1b2d62fb",
    "4acc7107",
    "54db823b",
    "3eda0437",
    "7953d61e",
    "0692e18c",
    "834ec97d",
    "b2862040",
    "88207623",
    "1a07d186",
    "82819916",
    "90347967",
    "b7999b51",
    "3befdf3e",
    "e9bb6954",
    "137eaa0f",
    "15663ba9",
    "0a938d79",
    "05269061",
    "e66aafb8",
    "40853293",
    "36fdfd69",
    "55783887",
    "15696249",
    "e9b4f6fc",
    "ecaa0ec1",
    "f0df5ff0",
    "f21745ec",
    "fb791726",
    "e9614598",
    "5289ad53",
    "1190e5a7",
    "3f23242b",
    "7bb29440",
    "be03b35f",
    "1b60fb0c",
    "855e0971",
    "c0f76784",
    "00576224",
    "0bb8deee",
    "2072aba6",
    "358ba94e",
    "50aad11f",
    "67636eac",
    "a680ac02",
    "d4b1c2b1",
    "e1baa8a4",
    "f5aa3634",
    "017c7c7b",
    "1f85a75f",
    "c658a4bd",
    "cd3c21df",
    "b9b7f026",
    "d10ecb37",
    "d0f5fe59",
    "c909285e",
    "bbc9ae5d",
    "c9e6f938",
    "d631b094",
    "e50d258f",
    "d9fac9be",
    "e3497940",
    "eb5a1d5d",
    "f25fbde4",
    "f8ff0b80",
    "f9012d9b",
    "be94b721",
    "b91ae062",
    "9af7a82c",
    "9f236235",
    "963e52fc",
    "8d5021e8",
    "90c28cc7",
    "8e1813be",
    "7b7f7511",
    "746b3537",
    "3979b1a8",
    "aee291af",
    "c8b7cc0f",
    "0520fde7",
    "2013d3e2",
    "28bf18c6",
    "39a8645d",
    "3af2c5a8",
    "3de23699",
    "4522001f",
    "48d8fb45",
    "5117e062",
    "5614dbcf",
    "5ad4f10b",
    "62c24649",
    "67e8384a",
    "681b3aeb",
    "6fa7a44f",
    "72ca375d",
    "7468f01a",
    "88a62173",
    "a740d043",
    "ac0a08a4",
    "b94a9452",
    "2dd70a9a",
    "6d58a25d",
    "e73095fd",
    "e8dc4411",
    "a2fd1cf0",
    "d4a91cb9",
    "91714a58",
    "508bd3b6",
    "1da012fc",
    "d43fd935",
    "22233c11",
    "bf32578f",
    "55059096",
    "c35c1b4c",
    "ae58858e",
    "1f642eb9",
    "e5790162",
    "58743b76",
    "f3cdc58f",
    "2204b7a8",
    "6df30ad6",
    "67c52801",
    "575b1a71",
    "11e1fe23",
    "e69241bd",
    "a9f96cdd",
    "2c608aff",
    "770cc55f",
    "150deff5",
  ],
  "hard": [
    "d19f7514",
    "7837ac64",
    "83302e8f",
    "539a4f51",
    "995c5fa3",
    "f5c89df1",
    "a096bf4d",
    "3906de3d",
    "44d8ac46",
    "73c3b0d8",
    "ac605cbb",
    "3e980e27",
    "846bdb03",
    "d07ae81c",
    "cdecee7f",
    "1acc24af",
    "2685904e",
    "3490cc26",
    "e78887d1",
    "dc2e9a9d",
    "e7b06bea",
    "dc2aa30b",
    "8597cfd7",
    "84db8fc4",
    "1c0d0a4b",
    "4cd1b7b2",
    "dbc1a6ce",
    "4ff4c9da",
    "d2abd087",
    "75b8110e",
    "b0c4d837",
    "f8be4b64",
    "9edfc990",
    "1c56ad9f",
    "7d419a02",
    "85fa5666",
    "8ba14f53",
    "184a9768",
    "0607ce86",
    "09629e4f",
    "f9a67cb5",
    "df8cc377",
    "ca8de6ea",
    "d94c3b52",
    "79369cc6",
    "94133066",
    "12997ef3",
    "f3e62deb",
    "bda2d7a6",
    "7039b2d7",
    "d06dbe63",
    "de1cd16c",
    "7c9b52a0",
    "93b4f4b3",
    "d4c90558",
    "a8c38be5",
    "8a004b2b",
    "780d0b14",
    "77fdfe62",
    "3f7978a0",
    "8efcae92",
    "a61ba2ce",
    "ae4f1146",
    "f8b3ba0a",
    "50f325b5",
    "7e02026e",
    "8ee62060",
    "99306f82",
    "f35d900a",
    "f15e1fac",
    "d9f24cd1",
    "cbded52d",
    "97a05b5b",
    "ce602527",
    "aa300dc3",
    "69889d6e",
    "009d5c81",
    "0a1d4ef5",
    "0becf7df",
    "0f63c0b9",
    "103eff5b",
    "17b80ad2",
    "1e81d6f9",
    "27a77e38",
    "29700607",
    "2a5f8217",
    "2c0b0aff",
    "2c737e39",
    "3391f8c0",
    "37d3e8b2",
    "477d2879",
    "59341089",
    "6f473927",
    "7c8af763",
    "2bee17df",
    "776ffc46",
    "80af3007",
    "8f2ea7aa",
    "9d9215db",
    "ff28f65a",
    "fcc82909",
    "cf98881b",
    "b230c067",
    "a5313dff",
    "a87f7484",
    "91413438",
    "c3e719e8",
    "7fe24cdd",
    "7c008303",
    "6b9890af",
    "9356391f",
    "cb227835",
    "ce039d91",
    "19bb5feb",
    "f3b10344",
    "e760a62e",
    "1d0a4b61",
    "0934a4d8",
    "9b4c17c4",
    "903d1b4a",
    "4aab4007",
    "47996f11",
    "1f0c79e5",
    "1a6449f1",
    "ca8f78db",
    "c663677b",
    "af22c60d",
    "929ab4e9",
    "e74e1818",
    "ccd554ac",
    "3631a71a",
    "b8825c91",
    "caa06a1f",
    "662c240a",
  ],
  "very-hard": [
    "4852f2fa",
    "025d127b",
    "12422b43",
    "14754a24",
    "fafffa47",
    "e872b94a",
    "8e2edd66",
    "ed74f2f2",
    "94f9d214",
    "99b1bc43",
    "f2829549",
    "3d31c5b3",
    "08573cc6",
    "ce4f8723",
    "cce03e0d",
    "a68b268e",
    "6773b310",
    "b0722778",
    "e99362f0",
    "ea9794b1",
    "6430c8c4",
    "66f2d22f",
    "506d28a5",
    "6a11f6da",
    "27f8ce4f",
    "0c9aba6e",
    "2697da3f",
    "34b99a2b",
    "48f8583b",
    "195ba7dc",
    "281123b4",
    "d47aa2ff",
    "e133d23d",
    "b942fd60",
    "85b81ff1",
    "42a15761",
    "642d658d",
    "9ddd00f0",
    "bf89d739",
    "007bbfb7",
    "62ab2642",
    "0d87d2a6",
    "31adaf00",
    "bb52a14b",
    "4c5c2cf0",
    "a934301b",
    "36d67576",
    "6455b5f5",
    "4938f0c2",
    "90f3ed37",
    "1fad071e",
    "b782dc8a",
    "96a8c0cd",
    "070dd51e",
    "fe9372f3",
    "264363fd",
    "3b4c2228",
    "239be575",
    "c3202e5a",
    "1e32b0e9",
    "234bbc79",
    "5521c0d9",
    "0e671a1a",
    "3194b014",
    "6ad5bdfd",
    "73ccf9c2",
    "9b365c51",
    "9c56f360",
    "992798f6",
    "af24b4cc",
    "c074846d",
    "53b68214",
    "bbb1b8b6",
    "e21a174a",
    "d4469b4b",
    "31d5ba1a",
    "dae9d2b5",
    "794b24be",
    "e345f17b",
    "b1fc8b8e",
    "3428a4f5",
    "5d2a5c43",
    "1d398264",
    "8b28cd80",
    "6ea4a07e",
    "44f52bb0",
    "92e50de0",
    "06df4c85",
    "b527c5c6",
    "aa4ec2a5",
    "aab50785",
    "fd096ab6",
    "363442ee",
    "b775ac94",
    "c1d99e64",
    "a04b2602",
    "8719f442",
    "ea959feb",
    "c444b776",
    "25094a63",
    "feca6190",
    "de493100",
    "469497ad",
    "40f6cd08",
    "2753e76c",
    "db93a21d",
    "f9d67f8b",
    "b7f8a4d8",
    "d304284e",
    "e41c6fd3",
    "833dafe3",
    "bcb3040b",
    "50846271",
    "ad7e01d0",
    "cad67732",
    "981571dc",
    "95a58926",
    "5b692c0f",
    "57aa92db",
    "d22278a0",
    "319f2597",
    "a59b95c0",
    "5b6cbef5",
    "1e97544e",
    "e1d2900e",
    "a64e4611",
    "68b16354",
    "da515329",
    "484b58aa",
    "d931c21c",
    "39e1d7f9",
    "52fd389e",
    "8eb1be9a",
    "a57f2f04",
    "e95e3d8e",
    "4e45f183",
    "3ee1011a",
  ],
  "expert": [
    "10fcaaa3",
    "c92b942c",
    "b4a43f3b",
    "c64f1187",
    "256b0a75",
    "15113be4",
    "e5c44e8f",
    "817e6c09",
    "2037f2c7",
    "212895b5",
    "456873bc",
    "b9630600",
    "505fff84",
    "b457fec5",
    "e681b708",
    "5c2c9af4",
    "414297c0",
    "03560426",
    "22a4bbc2",
    "e6de6e8f",
    "73251a56",
    "a78176bb",
    "136b0064",
    "896d5239",
    "712bf12e",
    "1caeab9d",
    "05a7bcf2",
    "09c534e7",
    "e619ca6e",
    "3ed85e70",
    "16b78196",
    "fd4b2b02",
    "b190f7f5",
    "ac0c5833",
    "33b52de3",
    "762cd429",
    "93c31fbe",
    "891232d6",
    "b20f7c8b",
    "94be5b80",
    "626c0bcc",
    "6a1e5592",
    "673ef223",
    "6855a6e4",
    "f8a8fe49",
    "fea12743",
    "4c177718",
    "18419cfa",
    "5a5a2103",
    "9b2a60aa",
    "5833af48",
    "9110e3c5",
    "d5c634a2",
    "c87289bb",
    "dd2401ed",
    "b0f4d537",
    "6d0160f0",
    "9aec4887",
  ],
  "unfixed": [
    "58e15b12",
    "a8610ef7",
    "423a55dc",
    "bd14c3bf",
    "310f3251",
    "79fb03f4",
  ]
};
