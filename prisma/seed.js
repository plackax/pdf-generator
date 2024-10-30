import { PrismaClient } from "@prisma/client";
import {
  defaultTemplate,
  defaultFooter,
  defaultHeader,
} from "./default-template.js";

const getFormattedDateBetween = (initialDate, finalDate) => {
  const splitInitialDate = initialDate.split("-");
  const splitFinalDate = finalDate.split("-");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getSuffix = (day) => {
    let suffixDay = "th";
    switch (day) {
      case "1":
        suffixDay = "st";
        break;
      case "2":
        suffixDay = "nd";
        break;
      case "3":
        suffixDay = "rd";
        break;
      default:
        suffixDay = "th";
        break;
    }

    return suffixDay;
  };

  const suffixInitialDay = getSuffix(splitInitialDate[2][1]);
  const suffixFinalDay = getSuffix(splitFinalDate[2][1]);

  const formattedInitialDate = `from ${
    months[Number(splitInitialDate[1]) - 1]
  } ${
    splitInitialDate[2].startsWith("0")
      ? splitInitialDate[2][1]
      : splitInitialDate[2]
  }${suffixInitialDay} to the${
    months[Number(splitInitialDate[1]) - 1] !==
    months[Number(splitFinalDate[1]) - 1]
      ? " " + months[Number(splitFinalDate[1]) - 1]
      : ""
  } ${
    splitFinalDate[2].startsWith("0") ? splitFinalDate[2][1] : splitFinalDate[2]
  }${suffixFinalDay} ${splitFinalDate[0]}`;

  return formattedInitialDate;
};

const prisma = new PrismaClient();

const technicalDelegates = [
  {
    firstName: "Pedro",
    lastName: "Arroyo",
    country: "PUR",
    email: "pedro.arroyo@td.fiba.basketball",
    phone: "(939) 940-1753",
  },
  {
    firstName: "Rocio",
    lastName: "Barinaga",
    country: "ARG",
    email: "rocio.barinaga@td.fiba.basketball",
    phone: "[351 533 6020]",
  },
  {
    firstName: "Paulo",
    lastName: "Bassul",
    country: "BRA",
    email: "paulo.bassul@td.fiba.basketball",
    phone: "[55 11 943281665]",
  },
  {
    firstName: "Frederick",
    lastName: "Brown",
    country: "BAH",
    email: "frederick.brown@td.fiba.basketball",
    phone: "(242) 424-0718",
  },
  {
    firstName: "Alvaro",
    lastName: "Butureira",
    country: "URU",
    email: "alvaro.butureira@td.fiba.basketball",
    phone: "[+598 99 262-830]",
  },
  {
    firstName: "Nicolas",
    lastName: "Butureira",
    country: "URU",
    email: "nicolas.butureira@td.fiba.basketball",
    phone: "[+598 99 601-544]",
  },
  {
    firstName: "Matias",
    lastName: "Cardelle",
    country: "ARG",
    email: "matias.cardelle@td.fiba.basketball",
    phone: "[+54 9 11 6903-5404]",
  },
  {
    firstName: "Juan Luis",
    lastName: "Carrillo",
    country: "MEX",
    email: "juanluis.carrillo@td.fiba.basketball",
    phone: "[+52 33 3809-3235]",
  },
  {
    firstName: "Fatima",
    lastName: "Da Silva",
    country: "BRA",
    email: "fatima.dasilva@td.fiba.basketball",
    phone: "[55 11 982-69-6812]",
  },
  {
    firstName: "Diogenes",
    lastName: "De Urquiza",
    country: "ARG",
    email: "diogenes.deurquiza@td.fiba.basketball",
    phone: "",
  },
  {
    firstName: "Pablo",
    lastName: "Delego",
    country: "ARG",
    email: "pablo.delego@td.fiba.basketball",
    phone: "[+54 9 11 6042-4220]",
  },
  {
    firstName: "Jose",
    lastName: "Diez",
    country: "COL",
    email: "jose.diez@td.fiba.basketball",
    phone: "[+57 321 701-3919]",
  },
  {
    firstName: "Elka",
    lastName: "Jimenez",
    country: "DOM",
    email: "elka.jimenez@td.fiba.basketball",
    phone: "(809) 981-0010",
  },
  {
    firstName: "Guilherme",
    lastName: "Lotufo",
    country: "BRA",
    email: "guilherme.lotufo@td.fiba.basketball",
    phone: "[+55 11 99686-6810]",
  },
  {
    firstName: "Edgard",
    lastName: "Marin",
    country: "PUR",
    email: "edgard.marin@td.fiba.basketball",
    phone: "",
  },
  {
    firstName: "Eugenia",
    lastName: "Martellotto",
    country: "ARG",
    email: "eugenia.martellotto@td.fiba.basketball",
    phone: "[54 9 351 620 7045]",
  },
  {
    firstName: "Fabio",
    lastName: "Martinez",
    country: "PAR",
    email: "fabio.martinez@td.fiba.basketball",
    phone: "[+595 97 135-9530]",
  },
  {
    firstName: "Juan Facundo",
    lastName: "Mazzuchi",
    country: "ARG",
    email: "juanfacundo.mazzuchi@td.fiba.basketball",
    phone: "[+54 9 2235 24-3066]",
  },
  {
    firstName: "Patricio",
    lastName: "Menares",
    country: "CHI",
    email: "patricio.menares@td.fiba.basketball",
    phone: "[+56 9 8500-4266]",
  },
  {
    firstName: "Claudio",
    lastName: "Mortari",
    country: "BRA",
    email: "claudio.mortari@td.fiba.basketball",
    phone: "[+55 11 98 555-6747]",
  },
  {
    firstName: "Felipe",
    lastName: "Muñoz",
    country: "CHI",
    email: "felipe.munoz@td.fiba.basketball",
    phone: "[+56 9 9154-7529]",
  },
  {
    firstName: "Oswaldo",
    lastName: "Narvaez",
    country: "VEN",
    email: "oswaldo.narvaez@td.fiba.basketball",
    phone: "[+58 414-141-7090]",
  },
  {
    firstName: "Facundo",
    lastName: "Petracci",
    country: "ARG",
    email: "facundo.petracci@td.fiba.basketball",
    phone: "",
  },
  {
    firstName: "Pedro",
    lastName: "Raga",
    country: "COL",
    email: "pedro.raga@td.fiba.basketball",
    phone: "[+57 321-269-1737]",
  },
  {
    firstName: "Gabriela",
    lastName: "Schaer",
    country: "CRC",
    email: "gabriela.schaer@td.fiba.basketball",
    phone: "[+506 8332-6820]",
  },
  {
    firstName: "Ian",
    lastName: "Yearwood",
    country: "CAY",
    email: "ian.yearwood@td.fiba.basketball",
    phone: "(345) 926-0797",
  },
];

const comissionersPeople = [
  {
    zone: "CARIBBEAN",
    country: "BAH",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Terez Verona",
    lastName: "Conliffe",
    countryResidence: "BAHAMAS",
    email: "edmacon@hotmail.com",
    cellphone: "+1 242 225 2000",
  },
  {
    zone: "CARIBBEAN",
    country: "BAR",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Janelle",
    lastName: "Pilgrim",
    countryResidence: "BARBADOS",
    email: "janelle_pilgrim@hotmail.com",
    cellphone: "+246 416-8572",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Andreza",
    lastName: "Sousa Almeida",
    countryResidence: "BRAZIL",
    email: "andrezaarbitragem@gmail.com",
    cellphone: "+55 61 8172-1141",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Daniela",
    lastName: "Da Costa Oliveira",
    countryResidence: "BRAZIL",
    email: "danicosta.basket@gmail.com",
    cellphone: "+55 51 99698-6403",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Fernando",
    lastName: "Serpa De Oliveira",
    countryResidence: "BRAZIL",
    email: "serpabasquete@hotmail.com",
    cellphone: "+55 51 9985-0150",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "João",
    lastName: "Junior",
    countryResidence: "BRAZIL",
    email: "jjsj.adv@gmail.com",
    cellphone: "+55 83 99633-2898",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Karla",
    lastName: "Diniz",
    countryResidence: "BRAZIL",
    email: "karlacgdiniz@hotmail.com",
    cellphone: "+55 21 98841-3188",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Lupércio",
    lastName: "Cardoso",
    countryResidence: "BRAZIL",
    email: "lupacardoso12@gmail.com",
    cellphone: "+55 11 95129-9130",
  },
  {
    zone: "CONSUBASQUET",
    country: "BRA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Maurício",
    lastName: "Camaroto",
    countryResidence: "BRAZIL",
    email: "mcamaroto@gmail.com",
    cellphone: "+55 48 99947-6496",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Anna Maria",
    lastName: "Del Col",
    countryResidence: "CANADA",
    email: "annamariadelcol@outlook.com",
    cellphone: "+1 519 362-1228",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Jeffrey Scott",
    lastName: "Critch",
    countryResidence: "CANADA",
    email: "scottcritchphysics@gmail.com",
    cellphone: "+1 709 486-1421",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Mike Amir",
    lastName: "Homsy",
    countryResidence: "CANADA",
    email: "mikehomsy@johnabbott.qc.ca",
    cellphone: "+1 514 893-3699",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Neil Andrew",
    lastName: "Donnelly",
    countryResidence: "CANADA",
    email: "neil.donnelly@conexusartscentre.ca",
    cellphone: "+1 306 536-7027",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Perry",
    lastName: "Stothart",
    countryResidence: "CANADA",
    email: "perry@classiclandscapes.com",
    cellphone: "+1 780 465-2710",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Sanam",
    lastName: "Nezami Tafreshi",
    countryResidence: "CANADA",
    email: "nezami.s@gmail.com",
    cellphone: "+98 212 284-5108",
  },
  {
    zone: "NORTH AMERICA",
    country: "CAN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Sebastien",
    lastName: "Gauthier",
    countryResidence: "CANADA",
    email: "sbastiengauthier3@hotmail.com",
    cellphone: "+1 514 349-0300",
  },
  {
    zone: "CARIBBEAN",
    country: "CAY",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Antonio",
    lastName: "Hanna",
    countryResidence: "CAYMAN ISLANDS",
    email: "antoniohanna_569@msn.com",
    cellphone: "+1 345 949-9175",
  },
  {
    zone: "CONSUBASQUET",
    country: "CHI",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Francisco José",
    lastName: "Arévalo Mateluna",
    countryResidence: "CHILE",
    email: "arevalofrancico67@gmail.com",
    cellphone: "+56 96306-8963",
  },
  {
    zone: "CONSUBASQUET",
    country: "CHI",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Ibis Jeanethe",
    lastName: "Ríos Ríos",
    countryResidence: "CHILE",
    email: "ibis.rios@gmail.com",
    cellphone: "+56 99658-0546",
  },
  {
    zone: "CONSUBASQUET",
    country: "CHI",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Juan Enrique",
    lastName: "Sumonte Bernales",
    countryResidence: "CHILE",
    email: "jsumonte89@gmail.com",
    cellphone: "+56 98362-4240",
  },
  {
    zone: "CONSUBASQUET",
    country: "CHI",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Patricio Enrique",
    lastName: "Menares Vásquez",
    countryResidence: "CHILE",
    email: "patricio.menares@td.fiba.basketball",
    cellphone: "+56 98500-4266",
  },
  {
    zone: "CONSUBASQUET",
    country: "COL",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Carlos Eduardo",
    lastName: "Gonzalez",
    countryResidence: "COLOMBIA",
    email: "carlos.eduardo.gonzalez@outlook.com",
    cellphone: "",
  },
  {
    zone: "CONSUBASQUET",
    country: "COL",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Jose Hernan",
    lastName: "Melgarejo Pinto",
    countryResidence: "COLOMBIA",
    email: "hmelgarejo10@gmail.com",
    cellphone: "+57 301 626-3036",
  },
  {
    zone: "CONSUBASQUET",
    country: "COL",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Lis Angel",
    lastName: "Bedoya Sanchez",
    countryResidence: "COLOMBIA",
    email: "langelbes@gmail.com",
    cellphone: "",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "CRC",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Gabriela",
    lastName: "Schaer Araya",
    countryResidence: "COSTA RICA",
    email: "gschaera@hotmail.com",
    cellphone: "+506 8332-6820",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "CRC",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Mauricio",
    lastName: "Umana Torres",
    countryResidence: "COSTA RICA",
    email: "mumana24@hotmail.com",
    cellphone: "+506 6171-1214",
  },
  {
    zone: "CARIBBEAN",
    country: "DOM",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Maximo Ambiorix",
    lastName: "Cruz Caruajal",
    countryResidence: "DOMINICAN REPUBLIC",
    email: "ambiorix10@hotmail.com",
    cellphone: "+1 809 921-0149",
  },
  {
    zone: "CONSUBASQUET",
    country: "ECU",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Luz Nohemi",
    lastName: "Espinoza Gavilanes",
    countryResidence: "ECUADOR",
    email: "eluz7840@gmail.com",
    cellphone: "+593 98762-7258",
  },
  {
    zone: "CONSUBASQUET",
    country: "ECU",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Victor",
    lastName: "Peralta Renteria",
    countryResidence: "ECUADOR",
    email: "dumaniperalta@yahoo.es",
    cellphone: "+593 99 555-3591",
  },
  {
    zone: "CARIBBEAN",
    country: "ISV",
    role: "COMMISSIONER",
    gender: "FEMALE",
    firstName: "Bianca",
    lastName: "Stevens",
    countryResidence: "VIRGIN ISLANDS",
    email: "stevensbianca@hotmail.com",
    cellphone: "+340 690-9981",
  },
  {
    zone: "CARIBBEAN",
    country: "ISV",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Clement Jeron",
    lastName: "Heyliger",
    countryResidence: "VIRGIN ISLANDS",
    email: "champ_Que@yahoo.com",
    cellphone: "+340 277-9228",
  },
  {
    zone: "CARIBBEAN",
    country: "JAM",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Deon",
    lastName: "Williams",
    countryResidence: "JAMAICA",
    email: "brock22.dw@gmail.com",
    cellphone: "+876 890-7109",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "MEX",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Alberto",
    lastName: "Achutegui Lopez",
    countryResidence: "MEXICO",
    email: "achutegui_11@hotmail.com",
    cellphone: "+52 661 850-9494",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "MEX",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Gabriel",
    lastName: "Ramirez Leal",
    countryResidence: "MEXICO",
    email: "gabrielfiba@hotmail.com",
    cellphone: "+52 33 3808-9201",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "MEX",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Jose Hugo",
    lastName: "Salinas Pedroza",
    countryResidence: "MEXICO",
    email: "hugosalinasp@yahoo.com.mx",
    cellphone: "",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "MEX",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Juan Mauro",
    lastName: "Retiz Ruiz",
    countryResidence: "MEXICO",
    email: "retiz37@hotmail.com",
    cellphone: "+52 1 871 183-5902",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "NCA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Mauricio Jose",
    lastName: "Castellon Sanabria",
    countryResidence: "NICARAGUA",
    email: "mauricio_castellon@hotmail.com",
    cellphone: "+505 8656-3666",
  },
  {
    zone: "CONSUBASQUET",
    country: "PAR",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Fabio Ramón",
    lastName: "Martinez Acevedo",
    countryResidence: "PARAGUAY",
    email: "fabiomartinezfabio@gmail.com",
    cellphone: "+595 97135-9530",
  },
  {
    zone: "CARIBBEAN",
    country: "PUR",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Jose Anibal",
    lastName: "Carrion",
    countryResidence: "PUERTO RICO",
    email: "jcarrion11@comcast.net",
    cellphone: "+1 787 889-4552",
  },
  {
    zone: "CENTRAL AMERICA",
    country: "SUR",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Dwight",
    lastName: "King",
    countryResidence: "SURINAME",
    email: "sba.secretariaat@gmail.com",
    cellphone: "+597 46-2773",
  },
  {
    zone: "CARIBBEAN",
    country: "TCI",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Marc",
    lastName: "Nicolas",
    countryResidence: "TURKS & CAICOS",
    email: "marc.g.nicolas@gmail.com",
    cellphone: "+1 649 347-8139",
  },
  {
    zone: "CONSUBASQUET",
    country: "URU",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Hector Luis",
    lastName: "Uslenghi Sburlati",
    countryResidence: "URUGUAY",
    email: "hectoruslenghi@hotmail.com",
    cellphone: "+598 9662-7202",
  },
  {
    zone: "NORTH AMERICA",
    country: "USA",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Hector",
    lastName: "Sanchez",
    countryResidence: "USA",
    email: "hector.enrique@gmail.com",
    cellphone: "+1 954 260-6709",
  },
  {
    zone: "CONSUBASQUET",
    country: "VEN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "José Francisco",
    lastName: "Correa Medina",
    countryResidence: "VENEZUELA",
    email: "josefcorream@gmail.com",
    cellphone: "+58 41 4225-4858",
  },
  {
    zone: "CONSUBASQUET",
    country: "VEN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Roberto",
    lastName: "Oliveros",
    countryResidence: "VENEZUELA",
    email: "robertolivero_3@hotmail.com",
    cellphone: "+58 41 6751-2918",
  },
  {
    zone: "CONSUBASQUET",
    country: "VEN",
    role: "COMMISSIONER",
    gender: "MALE",
    firstName: "Roberto Jose",
    lastName: "Abreu Fernandez",
    countryResidence: "VENEZUELA",
    email: "robertojosea@gmail.com",
    cellphone: "+58 41 4068-4418",
  },
];

const vgos = [
  {
    lastName: "Saldarriaga",
    firstName: "Felipe",
    country: "COL",
    email: "fsh317@gmail.com",
    phone: "+57 319 3788591",
  },
  {
    lastName: "Molina",
    firstName: "Pablo",
    country: "COL",
    email: "molina.pablo9605@gmail.com",
    phone: "+57 300 7443502",
  },
  {
    lastName: "Gómez",
    firstName: "Matías",
    country: "URU",
    email: "matgom75@gmail.com",
    phone: "+598 99 284 633",
  },
  {
    lastName: "Guimaraes",
    firstName: "Gabriel",
    country: "URU",
    email: "g.guimaraes13@hotmail.com",
    phone: "+598 98 416 596",
  },
  {
    lastName: "Encinas",
    firstName: "Hernán",
    country: "MEX",
    email: "hernan.encinasf@gmail.com",
    phone: "+52 81 1301 5149",
  },
  {
    lastName: "Zurletti",
    firstName: "Joaquin",
    country: "ARG",
    email: "joaquin.zurletti@torneos.com",
    phone: "+54 9 11 6867-5657",
  },
  {
    lastName: "Lorenzo",
    firstName: "Ramiro",
    country: "ARG",
    email: "lorenzo.ramiro@gmail.com",
    phone: "+54 9 11 6136-4701",
  },
  {
    lastName: "Cordova",
    firstName: "Enrique",
    country: "PUR",
    email: "kike_cordova69@yahoo.com",
    phone: "+1 (787) 453-9754",
  },
  {
    lastName: "Marin",
    firstName: "Edgard",
    country: "PUR",
    email: "emarin624@gmail.com",
    phone: "+1 (787) 240-1100",
  },
  {
    lastName: "Jara",
    firstName: "Alfredo",
    country: "CHI",
    email: "alfredo.jara5@gmail.com",
    phone: "+56 9 6902 4109",
  },
];

async function main() {
  const [commissioner, td, vgo] = await Promise.all([
    prisma.variable.create({
      data: {
        key: "Commissioners",
        type: "selector",
      },
    }),
    prisma.variable.create({
      data: {
        key: "Technical Delegates",
        type: "selector",
      },
    }),
    prisma.variable.create({
      data: {
        key: "VGOs",
        type: "selector",
      },
    }),
  ]);

  const employee = await prisma.variable.create({
    data: {
      key: "EMPLOYEES",
      type: "variableSelector",
    },
  });

  const event = await prisma.variable.create({
    data: {
      key: "EVENTS",
      type: "selector",
    },
  });

  await Promise.all([
    prisma.value.createMany({
      data: comissionersPeople.map((person) => ({
        value: person.firstName + " " + person.lastName,
        idVariable: commissioner.id,
        metadata: JSON.stringify({
          country: person.country,
          email: person.email,
          phone: person.cellphone,
        }),
      })),
    }),
    prisma.value.createMany({
      data: technicalDelegates.map((person) => ({
        value: person.firstName + " " + person.lastName,
        idVariable: td.id,
        metadata: JSON.stringify({
          country: person.country,
          email: person.email,
          phone: person.phone,
        }),
      })),
    }),
    prisma.value.createMany({
      data: vgos.map((person) => ({
        value: person.firstName + " " + person.lastName,
        idVariable: vgo.id,
        metadata: JSON.stringify({
          country: person.country,
          email: person.email,
          phone: person.phone,
        }),
      })),
    }),
    prisma.value.createMany({
      data: [
        {
          value: commissioner.key.toString(),
          idVariable: employee.id,
        },
        {
          value: td.key.toString(),
          idVariable: employee.id,
        },
        {
          value: vgo.key.toString(),
          idVariable: employee.id,
        },
      ],
    }),
    prisma.value.createMany({
      data: [
        {
          value: "FIBA U18 Women's AMERICUP",
          idVariable: event.id,
          metadata: JSON.stringify({
            city: "Bucaramanga",
            country: "Colombia",
            dates_between: getFormattedDateBetween("2024-06-17", "2024-06-23"),
          }),
        },
      ],
    }),
    prisma.template.create({
      data: {
        name: "FIBA's AMERICUP",
        header: defaultHeader,
        footer: defaultFooter,
        body: defaultTemplate,
        fullContent: defaultHeader + defaultTemplate + defaultFooter,
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    global.process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
