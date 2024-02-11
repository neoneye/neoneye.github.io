// Based on by Davide Bonin, 'Task Tagging' notebook
// https://www.kaggle.com/code/davidbnn92/task-tagging/notebook
const ARC_TAGS = {
    "adapt_image_to_grid": [
        "09629e4f"
    ],
    "algebra": [
        "91413438",
        "db93a21d"
    ],
    "associate_color_to_bools": [
        "9565186b"
    ],
    "associate_colors_to_bools": [
        "67385a82",
        "83302e8f",
        "868de0fa",
        "8d510a79",
        "aedd82e4",
        "b230c067",
        "b2862040"
    ],
    "associate_colors_to_colors": [
        "0d3d703e",
        "82819916",
        "913fb3ed",
        "b1948b0a",
        "c8f0f002",
        "d511f180",
        "f76d97a5"
    ],
    "associate_colors_to_images": [
        "995c5fa3",
        "a85d4709"
    ],
    "associate_colors_to_numbers": [
        "6773b310",
        "6e82a1ae",
        "c0f76784",
        "d2abd087",
        "e8593010"
    ],
    "associate_colors_to_patterns": [
        "150deff5",
        "27a28665",
        "776ffc46"
    ],
    "associate_colors_to_ranks": [
        "08ed6ac7",
        "6455b5f5",
        "694f12f3",
        "a61f2674",
        "a65b410d",
        "ea32f347"
    ],
    "associate_colors_to_shapes": [
        "e509e548"
    ],
    "associate_images_to_bools": [
        "239be575",
        "44f52bb0"
    ],
    "associate_images_to_colors": [
        "d4469b4b"
    ],
    "associate_images_to_images": [
        "54d9e175"
    ],
    "associate_images_to_numbers": [
        "1fad071e",
        "6e02f1e3",
        "794b24be",
        "b0c4d837",
        "d0f5fe59",
        "ff28f65a"
    ],
    "associate_images_to_patterns": [
        "27a28665"
    ],
    "associate_patterns_to_colors": [
        "0ca9ddb6"
    ],
    "associate_patterns_to_patterns": [
        "0e206a2e"
    ],
    "background_filling": [
        "2bcee788",
        "7b6016b9",
        "9edfc990",
        "a64e4611",
        "f8c80d96"
    ],
    "bounce": [
        "a3df8b1e"
    ],
    "bouncing": [
        "e179c5f4"
    ],
    "bridges": [
        "d6ad076f",
        "ef135b50"
    ],
    "bring_patterns_close": [
        "05f2a901",
        "1a07d186",
        "234bbc79",
        "681b3aeb",
        "98cf29f8",
        "a48eeaf7",
        "a61ba2ce",
        "ae3edfdc",
        "d687bc17"
    ],
    "color_guessing": [
        "1190e5a7",
        "25d487eb",
        "4347f46a",
        "47c1f68c",
        "5ad4f10b",
        "77fdfe62",
        "7837ac64",
        "7b6016b9",
        "7c008303",
        "7e0986d6",
        "82819916",
        "85c4e7cd",
        "868de0fa",
        "8e1813be",
        "928ad970",
        "93b581b8",
        "9aec4887",
        "aabf363d",
        "bd4472b8",
        "d07ae81c"
    ],
    "color_matching": [
        "22eb0ac0",
        "846bdb03"
    ],
    "color_palette": [
        "6ecd11f4",
        "7c008303",
        "b190f7f5",
        "bd4472b8",
        "c9f8e694",
        "ddf7fa4f",
        "e21d9049"
    ],
    "color_permutation": [
        "85c4e7cd",
        "bda2d7a6"
    ],
    "compare_image": [
        "63613498"
    ],
    "concentric": [
        "4290ef0e"
    ],
    "connect_the_dots": [
        "06df4c85",
        "1f876c06",
        "22eb0ac0",
        "253bf280",
        "40853293",
        "6cdd2623",
        "a2fd1cf0",
        "a699fb00",
        "cbded52d",
        "d4a91cb9",
        "d6ad076f",
        "dbc1a6ce",
        "ded97339",
        "ef135b50"
    ],
    "contouring": [
        "31aa019c",
        "4258a5f9",
        "5168d44c",
        "543a7ed5",
        "67a423a3",
        "6f8cd79b",
        "890034e9",
        "913fb3ed",
        "b27ca6d3",
        "b527c5c6",
        "db93a21d",
        "dc1df850"
    ],
    "count_different_colors": [
        "6e02f1e3",
        "b91ae062",
        "c3e719e8",
        "fcc82909"
    ],
    "count_hor_lines": [
        "1190e5a7"
    ],
    "count_patterns": [
        "1fad071e",
        "39a8645d"
    ],
    "count_shapes": [
        "d0f5fe59",
        "ff28f65a"
    ],
    "count_tiles": [
        "09629e4f",
        "29623171",
        "29c11459",
        "2bee17df",
        "42a50994",
        "5582e5ca",
        "6773b310",
        "6e82a1ae",
        "794b24be",
        "8efcae92",
        "91413438",
        "9565186b",
        "9af7a82c",
        "a3325580",
        "a61f2674",
        "a65b410d",
        "ac0a08a4",
        "ae4f1146",
        "aedd82e4",
        "b27ca6d3",
        "be94b721",
        "beb8660c",
        "ce9e57f2",
        "d2abd087",
        "d631b094",
        "de1cd16c",
        "e48d4e1a",
        "e50d258f",
        "e8593010",
        "ea32f347",
        "f8b3ba0a",
        "f8ff0b80",
        "fcb5c309"
    ],
    "count_ver_lines": [
        "1190e5a7"
    ],
    "create_grid": [
        "09629e4f"
    ],
    "create_image_from_info": [
        "1190e5a7"
    ],
    "crop": [
        "0b148d64",
        "1c786137",
        "1cf80156",
        "1f85a75f",
        "2013d3e2",
        "234bbc79",
        "23b5c85d",
        "28bf18c6",
        "2dc579da",
        "2dee498d",
        "39a8645d",
        "3de23699",
        "3f7978a0",
        "4290ef0e",
        "47c1f68c",
        "48d8fb45",
        "5117e062",
        "5ad4f10b",
        "5bd6f4ac",
        "5daaa586",
        "662c240a",
        "681b3aeb",
        "6b9890af",
        "6ecd11f4",
        "72ca375d",
        "7468f01a",
        "746b3537",
        "77fdfe62",
        "7837ac64",
        "7b7f7511",
        "7c008303",
        "80af3007",
        "846bdb03",
        "8731374e",
        "88a62173",
        "8a004b2b",
        "8efcae92",
        "8f2ea7aa",
        "90c28cc7",
        "97a05b5b",
        "9aec4887",
        "9ecd008a",
        "a61ba2ce",
        "a740d043",
        "a87f7484",
        "a8c38be5",
        "ae4f1146",
        "b94a9452",
        "bc1d5164",
        "be94b721",
        "c8cbb738",
        "c909285e",
        "ce602527",
        "d10ecb37",
        "d23f8c26",
        "dc0a314f",
        "e50d258f",
        "e6721834",
        "f25fbde4",
        "f9012d9b",
        "fcb5c309",
        "ff805c23"
    ],
    "cylindrical": [
        "d406998b"
    ],
    "detect_background_color": [
        "1190e5a7",
        "a740d043",
        "e50d258f"
    ],
    "detect_closed_curves": [
        "810b9b61",
        "83302e8f",
        "b2862040"
    ],
    "detect_connectedness": [
        "239be575"
    ],
    "detect_enclosure": [
        "1c786137",
        "776ffc46"
    ],
    "detect_grid": [
        "06df4c85",
        "09629e4f",
        "0b148d64",
        "1190e5a7",
        "1e32b0e9",
        "272f95fa",
        "29623171",
        "29ec7d0e",
        "2dc579da",
        "39e1d7f9",
        "47c1f68c",
        "54d9e175",
        "5daaa586",
        "6773b310",
        "6d0160f0",
        "77fdfe62",
        "780d0b14",
        "7837ac64",
        "7c008303",
        "83302e8f",
        "88a62173",
        "941d9a10",
        "9f236235",
        "a68b268e",
        "c1d99e64",
        "c444b776",
        "cbded52d",
        "e48d4e1a",
        "f8b3ba0a"
    ],
    "detect_hor_lines": [
        "25d8a9c8"
    ],
    "detect_repetition": [
        "2dee498d",
        "7b7f7511"
    ],
    "detect_symmetry": [
        "44f52bb0",
        "662c240a",
        "72ca375d"
    ],
    "detect_wall": [
        "0520fde7",
        "1b2d62fb",
        "3428a4f5",
        "363442ee",
        "63613498",
        "6430c8c4",
        "8d510a79",
        "8e5a5113",
        "995c5fa3",
        "99b1bc43",
        "bd4472b8",
        "ce4f8723",
        "cf98881b",
        "e3497940",
        "e98196ab",
        "f2829549"
    ],
    "diagonal_symmetry": [
        "73251a56",
        "74dd1130",
        "9dfd6313"
    ],
    "diagonals": [
        "05269061",
        "1f0c79e5",
        "1f876c06",
        "3bd67248",
        "469497ad",
        "5c0a986e",
        "623ea044",
        "6e19193c",
        "7ddcd7ec",
        "a3df8b1e",
        "aba27056",
        "b8cdaf2b",
        "d07ae81c",
        "d13f3404",
        "ea786f4a",
        "ec883f72",
        "feca6190"
    ],
    "direction_guesingcrop": [
        "8e1813be"
    ],
    "direction_guessing": [
        "045e512c",
        "05f2a901",
        "0a938d79",
        "178fcbfb",
        "1f0c79e5",
        "2281f1f4",
        "253bf280",
        "25d487eb",
        "2bcee788",
        "2dd70a9a",
        "3e980e27",
        "508bd3b6",
        "5168d44c",
        "56dc2b01",
        "5c0a986e",
        "5daaa586",
        "6855a6e4",
        "6e19193c",
        "746b3537",
        "760b3cac",
        "7ddcd7ec",
        "8403a5d5",
        "855e0971",
        "8d510a79",
        "a48eeaf7",
        "a78176bb",
        "b527c5c6",
        "b775ac94",
        "bdad9b1f",
        "d43fd935",
        "d4a91cb9",
        "d687bc17",
        "d89b689b",
        "dc433765",
        "e8dc4411",
        "e9614598",
        "f15e1fac"
    ],
    "divide_by_n": [
        "2dee498d"
    ],
    "dominant_color": [
        "5582e5ca",
        "d4469b4b",
        "d631b094",
        "f8b3ba0a"
    ],
    "draw_line_from_border": [
        "2bee17df",
        "3bd67248",
        "834ec97d",
        "c1d99e64"
    ],
    "draw_line_from_point": [
        "0a938d79",
        "178fcbfb",
        "2281f1f4",
        "23581191",
        "25d487eb",
        "264363fd",
        "29c11459",
        "2c608aff",
        "2dd70a9a",
        "41e4d17e",
        "469497ad",
        "508bd3b6",
        "5c0a986e",
        "5daaa586",
        "623ea044",
        "673ef223",
        "6d58a25d",
        "6e19193c",
        "7ddcd7ec",
        "82819916",
        "8403a5d5",
        "855e0971",
        "8731374e",
        "8d510a79",
        "97999447",
        "99fa7670",
        "a3df8b1e",
        "aba27056",
        "b527c5c6",
        "b8cdaf2b",
        "bdad9b1f",
        "d037b0a7",
        "d07ae81c",
        "d13f3404",
        "d43fd935",
        "d4f3cd78",
        "d6ad076f",
        "d9f24cd1",
        "db93a21d",
        "e21d9049",
        "ea786f4a",
        "ec883f72",
        "ecdecbb3",
        "ef135b50",
        "f15e1fac",
        "f1cefba8",
        "f5b8619d",
        "feca6190"
    ],
    "draw_parallel_line": [
        "a78176bb"
    ],
    "draw_pattern_from_point": [
        "3ac3eb23",
        "447fd412",
        "57aa92db"
    ],
    "draw_rectangle": [
        "928ad970"
    ],
    "enlarge_image": [
        "09629e4f"
    ],
    "even_or_odd": [
        "868de0fa"
    ],
    "ex_nihilo": [
        "28e73c20",
        "6f8cd79b",
        "af902bf9",
        "bd4472b8"
    ],
    "extrapolate_image_from_grid": [
        "7837ac64"
    ],
    "find_the_intruder": [
        "0b148d64",
        "1a07d186",
        "1f85a75f",
        "2dc579da",
        "31aa019c",
        "32597951",
        "3f7978a0",
        "47c1f68c",
        "48d8fb45",
        "5117e062",
        "662c240a",
        "6cdd2623",
        "6d0160f0",
        "72ca375d",
        "776ffc46",
        "88a62173",
        "91714a58",
        "a87f7484",
        "b230c067",
        "b27ca6d3",
        "b9b7f026",
        "c444b776",
        "c909285e",
        "ce602527",
        "d687bc17",
        "d9fac9be",
        "f8b3ba0a"
    ],
    "fractal_repetition": [
        "007bbfb7",
        "80af3007",
        "8f2ea7aa"
    ],
    "gravity": [
        "1e0a9b12",
        "3618c87e",
        "3906de3d",
        "4093f84a",
        "54d82841",
        "56dc2b01",
        "a48eeaf7",
        "ae3edfdc",
        "d687bc17",
        "d9f24cd1",
        "f15e1fac"
    ],
    "grid_coloring": [
        "06df4c85",
        "272f95fa",
        "29623171",
        "39e1d7f9",
        "7837ac64"
    ],
    "holes": [
        "3bdb4ada",
        "50cb2852",
        "855e0971",
        "9edfc990",
        "e8593010"
    ],
    "homeomorphism": [
        "e509e548"
    ],
    "image_expansion": [
        "017c7c7b",
        "49d1d64f",
        "539a4f51",
        "53b68214",
        "963e52fc",
        "bbc9ae5d",
        "c3e719e8",
        "cce03e0d",
        "d13f3404",
        "d23f8c26",
        "feca6190"
    ],
    "image_expasion": [
        "b190f7f5"
    ],
    "image_filling": [
        "05269061",
        "0dfd9992",
        "29ec7d0e",
        "2bcee788",
        "3631a71a",
        "484b58aa",
        "73251a56",
        "8eb1be9a",
        "9ecd008a",
        "c3f564a4",
        "caa06a1f"
    ],
    "image_juxtaposition": [
        "75b8110e",
        "e3497940",
        "e98196ab"
    ],
    "image_reflection": [
        "3af2c5a8",
        "46442a0e",
        "47c1f68c",
        "4c4377d9",
        "62c24649",
        "67a3c6ac",
        "67e8384a",
        "68b16354",
        "6d0aefbc",
        "6fa7a44f",
        "7468f01a",
        "74dd1130",
        "8be77c9e",
        "8d5021e8",
        "9dfd6313",
        "9f236235",
        "c9e6f938",
        "e3497940",
        "eb281b96"
    ],
    "image_repetition": [
        "007bbfb7",
        "10fcaaa3",
        "1e32b0e9",
        "3af2c5a8",
        "46442a0e",
        "47c1f68c",
        "4c4377d9",
        "62c24649",
        "67e8384a",
        "6d0aefbc",
        "6fa7a44f",
        "7fe24cdd",
        "8be77c9e",
        "8d5021e8",
        "8e5a5113",
        "91413438",
        "a416b8f3",
        "c3e719e8",
        "c444b776",
        "c9e6f938",
        "cce03e0d",
        "eb281b96",
        "f5b8619d"
    ],
    "image_resizing": [
        "469497ad",
        "46f33fce",
        "5614dbcf",
        "5ad4f10b",
        "80af3007",
        "9172f3a0",
        "ac0a08a4",
        "b190f7f5",
        "b91ae062",
        "c59eb873",
        "f25fbde4"
    ],
    "image_rotation": [
        "3af2c5a8",
        "3c9b0459",
        "4522001f",
        "6150a2bd",
        "62c24649",
        "67e8384a",
        "7fe24cdd",
        "8e5a5113",
        "ed36ccf7"
    ],
    "image_within_image": [
        "1f642eb9",
        "8e1813be"
    ],
    "inside_out": [
        "952a094c"
    ],
    "jigsaw": [
        "681b3aeb",
        "6a1e5592",
        "a61ba2ce",
        "a8c38be5",
        "c8cbb738"
    ],
    "loop_filling": [
        "00d62c1b",
        "228f6490",
        "4347f46a",
        "44d8ac46",
        "543a7ed5",
        "6455b5f5",
        "694f12f3",
        "7b6016b9",
        "83302e8f",
        "868de0fa",
        "941d9a10",
        "a5313dff",
        "bb43febb",
        "c0f76784",
        "d5d6de2d",
        "e73095fd",
        "e8593010"
    ],
    "maze": [
        "2dd70a9a",
        "b782dc8a"
    ],
    "measure_area": [
        "23b5c85d",
        "3eda0437",
        "445eab21",
        "6455b5f5",
        "67385a82",
        "694f12f3",
        "868de0fa",
        "c0f76784",
        "db93a21d"
    ],
    "measure_distance_from_side": [
        "834ec97d"
    ],
    "measure_length": [
        "08ed6ac7",
        "5521c0d9",
        "b0c4d837",
        "db93a21d",
        "e9614598"
    ],
    "mimic_pattern": [
        "272f95fa",
        "28e73c20"
    ],
    "obstacles": [
        "d9f24cd1",
        "f15e1fac"
    ],
    "one_yes_one_no": [
        "d406998b"
    ],
    "only_one": [
        "dc433765"
    ],
    "order_numbers": [
        "08ed6ac7",
        "9af7a82c",
        "beb8660c",
        "f8b3ba0a",
        "f8ff0b80"
    ],
    "out_of_boundary": [
        "7df24a62",
        "93b581b8",
        "a9f96cdd",
        "db3e9e38",
        "dc1df850",
        "e48d4e1a"
    ],
    "pairwise_analogy": [
        "4522001f",
        "7447852a",
        "941d9a10",
        "a5f85a15",
        "a79310a0",
        "b8cdaf2b",
        "ba26e723",
        "ba97ae07",
        "bc1d5164",
        "bda2d7a6",
        "cce03e0d",
        "cdecee7f",
        "d06dbe63",
        "d0f5fe59",
        "d22278a0"
    ],
    "parapraxis-correct": [
        "00576224",
        "0607ce86",
        "070dd51e",
        "09c534e7",
        "0b17323b",
        "0bb8deee",
        "0c786b71",
        "0c9aba6e",
        "0e671a1a",
        "103eff5b",
        "12997ef3",
        "137f0df0",
        "14754a24",
        "15663ba9",
        "1990f7a8",
        "19bb5feb",
        "1a2e2828",
        "1c0d0a4b",
        "1d0a4b61",
        "1d398264",
        "1e97544e",
        "2072aba6",
        "22a4bbc2",
        "2546ccf6",
        "27f8ce4f",
        "281123b4",
        "292dd178",
        "3194b014",
        "31d5ba1a",
        "31d5ba1a",
        "32e9702f",
        "332efdb3",
        "33b52de3",
        "3979b1a8"
    ],
    "pattern_alignment": [
        "1caeab9d"
    ],
    "pattern_coloring": [
        "150deff5"
    ],
    "pattern_completion": [
        "1e32b0e9",
        "3345333e",
        "3aa6fb7a",
        "4612dd53",
        "50846271",
        "56ff96f3",
        "60b61512",
        "6d75e8bb",
        "b8825c91",
        "d8c310e9",
        "dc0a314f",
        "f9012d9b",
        "ff805c23"
    ],
    "pattern_deconstruction": [
        "150deff5",
        "1b60fb0c",
        "2013d3e2"
    ],
    "pattern_differences": [
        "3428a4f5"
    ],
    "pattern_expansion": [
        "017c7c7b",
        "045e512c",
        "05269061",
        "0962bcdd",
        "0a938d79",
        "0ca9ddb6",
        "0dfd9992",
        "10fcaaa3",
        "11852cab",
        "1b60fb0c",
        "1bfc4729",
        "1f0c79e5",
        "22168020",
        "22233c11",
        "29ec7d0e",
        "3631a71a",
        "3befdf3e",
        "444801d8",
        "484b58aa",
        "4938f0c2",
        "49d1d64f",
        "4c5c2cf0",
        "539a4f51",
        "53b68214",
        "54d82841",
        "56dc2b01",
        "5c2c9af4",
        "7447852a",
        "93b581b8",
        "95990924",
        "963e52fc",
        "97999447",
        "99fa7670",
        "9d9215db",
        "9ecd008a",
        "a3df8b1e",
        "a65b410d",
        "a699fb00",
        "aba27056",
        "b527c5c6",
        "b548a754",
        "b7249182",
        "b775ac94",
        "b782dc8a",
        "b8cdaf2b",
        "bbc9ae5d",
        "bd4472b8",
        "c3f564a4",
        "caa06a1f",
        "d037b0a7",
        "d06dbe63",
        "d22278a0",
        "d364b489",
        "d8c310e9",
        "db3e9e38",
        "dc1df850",
        "e179c5f4",
        "e21d9049",
        "e40b9e2f",
        "e8dc4411",
        "e9614598",
        "ec883f72",
        "f35d900a",
        "f5b8619d",
        "f8c80d96",
        "f9012d9b",
        "fcc82909",
        "feca6190",
        "ff805c23"
    ],
    "pattern_intersection": [
        "0520fde7",
        "1b2d62fb",
        "2281f1f4",
        "23581191",
        "6430c8c4",
        "67a423a3",
        "94f9d214",
        "99b1bc43",
        "f2829549",
        "fafffa47"
    ],
    "pattern_juxtaposition": [
        "0e206a2e",
        "137eaa0f",
        "264363fd",
        "321b1fc6",
        "363442ee",
        "36d67576",
        "3e980e27",
        "6aa20dc0",
        "72322fa7",
        "7df24a62",
        "88a10436",
        "8a004b2b",
        "97a05b5b",
        "a68b268e",
        "b775ac94",
        "bc1d5164",
        "cbded52d",
        "cf98881b",
        "d89b689b",
        "dae9d2b5",
        "e5062a87",
        "e6721834",
        "e76a88a6"
    ],
    "pattern_modification": [
        "025d127b",
        "a5f85a15",
        "b548a754",
        "ba26e723",
        "ba97ae07",
        "bda2d7a6",
        "cbded52d",
        "e9afcf9a",
        "ea786f4a",
        "ecdecbb3",
        "f1cefba8"
    ],
    "pattern_moving": [
        "05f2a901",
        "1caeab9d",
        "1e0a9b12",
        "228f6490",
        "25ff71a9",
        "4290ef0e",
        "5168d44c",
        "5521c0d9",
        "681b3aeb",
        "6855a6e4",
        "6a1e5592",
        "6b9890af",
        "6d0160f0",
        "846bdb03",
        "97a05b5b",
        "98cf29f8",
        "9aec4887",
        "a1570a43",
        "a48eeaf7",
        "a61ba2ce",
        "a79310a0",
        "a8c38be5",
        "bc1d5164",
        "beb8660c",
        "c8cbb738",
        "dc433765",
        "e48d4e1a",
        "e6721834",
        "f8a8fe49"
    ],
    "pattern_reflection": [
        "0e206a2e",
        "2bcee788",
        "3345333e",
        "36d67576",
        "3e980e27",
        "4938f0c2",
        "496994bd",
        "4c5c2cf0",
        "508bd3b6",
        "760b3cac",
        "846bdb03",
        "9d9215db",
        "9ecd008a",
        "b775ac94",
        "b8825c91",
        "e40b9e2f",
        "f25ffba3",
        "f8a8fe49"
    ],
    "pattern_repetition": [
        "017c7c7b",
        "0e206a2e",
        "264363fd",
        "28bf18c6",
        "29ec7d0e",
        "321b1fc6",
        "363442ee",
        "36d67576",
        "39e1d7f9",
        "3ac3eb23",
        "3bd67248",
        "3bdb4ada",
        "3e980e27",
        "41e4d17e",
        "4258a5f9",
        "444801d8",
        "447fd412",
        "484b58aa",
        "57aa92db",
        "6aa20dc0",
        "72322fa7",
        "7df24a62",
        "82819916",
        "834ec97d",
        "8403a5d5",
        "88a10436",
        "890034e9",
        "8a004b2b",
        "8eb1be9a",
        "90f3ed37",
        "b775ac94",
        "c9f8e694",
        "cbded52d",
        "d8c310e9",
        "e5062a87",
        "e76a88a6",
        "f25ffba3"
    ],
    "pattern_resizing": [
        "447fd412",
        "46f33fce",
        "57aa92db",
        "6aa20dc0",
        "6b9890af",
        "6ecd11f4",
        "80af3007",
        "8a004b2b"
    ],
    "pattern_rotation": [
        "0e206a2e",
        "1b60fb0c",
        "3631a71a",
        "36d67576",
        "3aa6fb7a",
        "4938f0c2",
        "4c5c2cf0",
        "7df24a62",
        "9d9215db",
        "9ecd008a",
        "b775ac94",
        "b8825c91",
        "e40b9e2f"
    ],
    "portals": [
        "673ef223"
    ],
    "projection_unto_rectangle": [
        "1f642eb9",
        "2c608aff",
        "4093f84a",
        "d43fd935"
    ],
    "proximity_guessing": [
        "2204b7a8"
    ],
    "recolor": [
        "47c1f68c"
    ],
    "recoloring": [
        "017c7c7b",
        "08ed6ac7",
        "2204b7a8",
        "234bbc79",
        "25d8a9c8",
        "32597951",
        "36fdfd69",
        "3bdb4ada",
        "3eda0437",
        "4093f84a",
        "50846271",
        "5117e062",
        "5168d44c",
        "5ad4f10b",
        "63613498",
        "67385a82",
        "673ef223",
        "6a1e5592",
        "6cf79266",
        "6e82a1ae",
        "6ecd11f4",
        "776ffc46",
        "77fdfe62",
        "7c008303",
        "810b9b61",
        "85c4e7cd",
        "8e1813be",
        "90f3ed37",
        "9565186b",
        "9aec4887",
        "a5f85a15",
        "a61f2674",
        "a740d043",
        "a79310a0",
        "a8d7556c",
        "aabf363d",
        "aedd82e4",
        "b1948b0a",
        "b230c067",
        "b2862040",
        "b6afb2da",
        "b775ac94",
        "ba26e723",
        "ba97ae07",
        "bda2d7a6",
        "bdad9b1f",
        "c8f0f002",
        "c9f8e694",
        "ce9e57f2",
        "d2abd087",
        "d406998b",
        "d4f3cd78",
        "dae9d2b5",
        "ddf7fa4f",
        "e509e548",
        "ea32f347",
        "f76d97a5",
        "fcb5c309"
    ],
    "rectangle_guessing": [
        "36fdfd69",
        "3de23699",
        "3eda0437",
        "3f7978a0",
        "444801d8",
        "44d8ac46",
        "4612dd53",
        "50cb2852",
        "56ff96f3",
        "5bd6f4ac",
        "5c2c9af4",
        "694f12f3",
        "6cf79266",
        "6d75e8bb",
        "7f4411dc",
        "83302e8f",
        "8731374e",
        "890034e9",
        "8a004b2b",
        "8efcae92",
        "90c28cc7",
        "928ad970",
        "952a094c",
        "a1570a43",
        "a64e4611",
        "a8d7556c",
        "ba97ae07",
        "bb43febb",
        "b6afb2da",
        "c909285e",
        "d4f3cd78",
        "e73095fd",
        "fcb5c309"
    ],
    "remove_intruder": [
        "ce602527"
    ],
    "remove_intruders": [
        "a3325580",
        "a61f2674",
        "a78176bb",
        "aabf363d",
        "d5d6de2d",
        "d687bc17"
    ],
    "remove_noise": [
        "25d8a9c8",
        "31aa019c",
        "3345333e",
        "42a50994",
        "5614dbcf",
        "5ad4f10b",
        "6cdd2623",
        "7e0986d6",
        "7f4411dc",
        "91714a58",
        "e26a3af2"
    ],
    "replace_pattern": [
        "6c434453",
        "a9f96cdd",
        "b190f7f5",
        "b60334d2",
        "b6afb2da",
        "ce22a75a",
        "d5d6de2d",
        "d90796e8"
    ],
    "separate_image": [
        "6d0160f0"
    ],
    "separate_images": [
        "0520fde7",
        "09629e4f",
        "0b148d64",
        "1b2d62fb",
        "1e32b0e9",
        "29623171",
        "3428a4f5",
        "54d9e175",
        "6430c8c4",
        "662c240a",
        "6773b310",
        "75b8110e",
        "7b7f7511",
        "7c008303",
        "855e0971",
        "88a62173",
        "8e5a5113",
        "8efcae92",
        "94f9d214",
        "995c5fa3",
        "99b1bc43",
        "9af7a82c",
        "a68b268e",
        "a85d4709",
        "a87f7484",
        "ae4f1146",
        "b190f7f5",
        "c444b776",
        "cbded52d",
        "ce4f8723",
        "cf98881b",
        "dae9d2b5",
        "de1cd16c",
        "e26a3af2",
        "e3497940",
        "e50d258f",
        "e98196ab",
        "f2829549",
        "fafffa47",
        "fcb5c309",
        "fcc82909"
    ],
    "separate_shapes": [
        "9565186b",
        "a3325580",
        "a61f2674",
        "aedd82e4",
        "b230c067",
        "be94b721",
        "d0f5fe59",
        "d2abd087",
        "ea32f347",
        "f8ff0b80"
    ],
    "shape_guessing": [
        "228f6490",
        "97a05b5b",
        "ce602527"
    ],
    "size_guessing": [
        "22233c11",
        "ac0a08a4",
        "b527c5c6",
        "b91ae062",
        "ce602527"
    ],
    "spacing": [
        "834ec97d"
    ],
    "summarize": [
        "4be741c5",
        "780d0b14",
        "90c28cc7",
        "995c5fa3",
        "9af7a82c",
        "9f236235",
        "a3325580",
        "a85d4709",
        "b9b7f026",
        "cdecee7f",
        "d631b094",
        "d89b689b",
        "d9fac9be",
        "de1cd16c",
        "eb5a1d5d",
        "f8b3ba0a",
        "f8ff0b80"
    ],
    "take_complement": [
        "6430c8c4",
        "94f9d214",
        "995c5fa3",
        "99b1bc43",
        "ce4f8723",
        "f2829549",
        "fafffa47"
    ],
    "take_half": [
        "ce9e57f2"
    ],
    "take_intersection": [
        "bdad9b1f",
        "ce4f8723"
    ],
    "take_maximum": [
        "29623171",
        "2bee17df",
        "39a8645d",
        "3eda0437",
        "445eab21",
        "6455b5f5",
        "8efcae92",
        "9565186b",
        "a3325580",
        "a61f2674",
        "be94b721",
        "c3e719e8",
        "de1cd16c",
        "e50d258f",
        "fcb5c309"
    ],
    "take_minimum": [
        "09629e4f",
        "23b5c85d",
        "6455b5f5",
        "a61f2674",
        "aedd82e4"
    ],
    "take_negative": [
        "27a28665",
        "3befdf3e",
        "3de23699",
        "b94a9452",
        "f76d97a5"
    ],
    "x_marks_the_spot": [
        "228f6490",
        "6855a6e4",
        "6b9890af",
        "846bdb03",
        "9aec4887",
        "a1570a43",
        "af902bf9",
        "b548a754",
        "d9fac9be"
    ]
};
