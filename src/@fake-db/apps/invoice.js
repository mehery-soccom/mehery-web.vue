import mock from '@/@fake-db/mock'
import { paginateArray } from '@/@fake-db/utils'
import avatar1 from '@app/assets/images/avatars/avatar-1.png'
import avatar2 from '@app/assets/images/avatars/avatar-2.png'
import avatar3 from '@app/assets/images/avatars/avatar-3.png'
import avatar4 from '@app/assets/images/avatars/avatar-4.png'
import avatar5 from '@app/assets/images/avatars/avatar-5.png'
import avatar6 from '@app/assets/images/avatars/avatar-6.png'
import avatar7 from '@app/assets/images/avatars/avatar-7.png'
import avatar8 from '@app/assets/images/avatars/avatar-8.png'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: '2-digit' })

const database = [
  {
    id: 4987,
    issuedDate: `${now.getFullYear()}-${currentMonth}-13`,
    client: {
      address: '7777 Mendez Plains',
      company: 'Hall-Robbins PLC',
      companyEmail: 'don85@johnson.com',
      country: 'USA',
      contact: '(616) 865-4180',
      name: 'Jordan Stevenson',
    },
    service: 'Software Development',
    total: 3428,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 724,
    dueDate: `${now.getFullYear()}-${currentMonth}-23`,
  },
  {
    id: 4988,
    issuedDate: `${now.getFullYear()}-${currentMonth}-17`,
    client: {
      address: '04033 Wesley Wall Apt. 961',
      company: 'Mccann LLC and Sons',
      companyEmail: 'brenda49@taylor.info',
      country: 'Haiti',
      contact: '(226) 204-8287',
      name: 'Stephanie Burns',
    },
    service: 'UI/UX Design & Development',
    total: 5219,
    avatar: avatar1,
    invoiceStatus: 'Downloaded',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-15`,
  },
  {
    id: 4989,
    issuedDate: `${now.getFullYear()}-${currentMonth}-19`,
    client: {
      address: '5345 Robert Squares',
      company: 'Leonard-Garcia and Sons',
      companyEmail: 'smithtiffany@powers.com',
      country: 'Denmark',
      contact: '(955) 676-1076',
      name: 'Tony Herrera',
    },
    service: 'Unlimited Extended License',
    total: 3719,
    invoiceStatus: 'Paid',
    avatar: avatar2,
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-03`,
  },
  {
    id: 4990,
    issuedDate: `${now.getFullYear()}-${currentMonth}-06`,
    client: {
      address: '19022 Clark Parks Suite 149',
      company: 'Smith, Miller and Henry LLC',
      companyEmail: 'mejiageorge@lee-perez.com',
      country: 'Cambodia',
      contact: '(832) 323-6914',
      name: 'Kevin Patton',
    },
    service: 'Software Development',
    total: 4749,
    avatar: avatar3,
    invoiceStatus: 'Sent',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-11`,
  },
  {
    id: 4991,
    issuedDate: `${now.getFullYear()}-${currentMonth}-08`,
    client: {
      address: '8534 Saunders Hill Apt. 583',
      company: 'Garcia-Cameron and Sons',
      companyEmail: 'brandon07@pierce.com',
      country: 'Martinique',
      contact: '(970) 982-3353',
      name: 'Mrs. Julie Donovan MD',
    },
    service: 'UI/UX Design & Development',
    total: 4056,
    avatar: avatar4,
    invoiceStatus: 'Draft',
    balance: 815,
    dueDate: `${now.getFullYear()}-${currentMonth}-30`,
  },
  {
    id: 4992,
    issuedDate: `${now.getFullYear()}-${currentMonth}-26`,
    client: {
      address: '661 Perez Run Apt. 778',
      company: 'Burnett-Young PLC',
      companyEmail: 'guerrerobrandy@beasley-harper.com',
      country: 'Botswana',
      contact: '(511) 938-9617',
      name: 'Amanda Phillips',
    },
    service: 'UI/UX Design & Development',
    total: 2771,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 2771,
    dueDate: `${now.getFullYear()}-${currentMonth}-24`,
  },
  {
    id: 4993,
    issuedDate: `${now.getFullYear()}-${currentMonth}-17`,
    client: {
      address: '074 Long Union',
      company: 'Wilson-Lee LLC',
      companyEmail: 'williamshenry@moon-smith.com',
      country: 'Montserrat',
      contact: '(504) 859-2893',
      name: 'Christina Collier',
    },
    service: 'UI/UX Design & Development',
    total: 2713,
    avatar: '',
    invoiceStatus: 'Draft',
    balance: 407,
    dueDate: `${now.getFullYear()}-${currentMonth}-22`,
  },
  {
    id: 4994,
    issuedDate: `${now.getFullYear()}-${currentMonth}-11`,
    client: {
      address: '5225 Ford Cape Apt. 840',
      company: 'Schwartz, Henry and Rhodes Group',
      companyEmail: 'margaretharvey@russell-murray.com',
      country: 'Oman',
      contact: '(758) 403-7718',
      name: 'David Flores',
    },
    service: 'Template Customization',
    total: 4309,
    avatar: avatar5,
    invoiceStatus: 'Paid',
    balance: -205,
    dueDate: `${now.getFullYear()}-${currentMonth}-13`,
  },
  {
    id: 4995,
    issuedDate: `${now.getFullYear()}-${currentMonth}-16`,
    client: {
      address: '23717 James Club Suite 277',
      company: 'Henderson-Holder PLC',
      companyEmail: 'dianarodriguez@villegas.com',
      country: 'Cambodia',
      contact: '(292) 873-8254',
      name: 'Valerie Perez',
    },
    service: 'Software Development',
    total: 3367,
    avatar: avatar6,
    invoiceStatus: 'Downloaded',
    balance: 3367,
    dueDate: `${now.getFullYear()}-${currentMonth}-24`,
  },
  {
    id: 4996,
    issuedDate: `${now.getFullYear()}-${currentMonth}-15`,
    client: {
      address: '4528 Myers Gateway',
      company: 'Page-Wise PLC',
      companyEmail: 'bwilson@norris-brock.com',
      country: 'Guam',
      contact: '(956) 803-2008',
      name: 'Susan Dickerson',
    },
    service: 'Software Development',
    total: 4776,
    avatar: avatar7,
    invoiceStatus: 'Downloaded',
    balance: 305,
    dueDate: `${now.getFullYear()}-${currentMonth}-02`,
  },
  {
    id: 4997,
    issuedDate: `${now.getFullYear()}-${currentMonth}-27`,
    client: {
      address: '4234 Mills Club Suite 107',
      company: 'Turner PLC Inc',
      companyEmail: 'markcampbell@bell.info',
      country: 'United States Virgin Islands',
      contact: '(716) 962-8635',
      name: 'Kelly Smith',
    },
    service: 'Unlimited Extended License',
    total: 3789,
    avatar: avatar8,
    invoiceStatus: 'Partial Payment',
    balance: 666,
    dueDate: `${now.getFullYear()}-${currentMonth}-18`,
  },
  {
    id: 4998,
    issuedDate: `${now.getFullYear()}-${currentMonth}-31`,
    client: {
      address: '476 Keith Meadow',
      company: 'Levine-Dorsey PLC',
      companyEmail: 'mary61@rosario.com',
      country: 'Syrian Arab Republic',
      contact: '(523) 449-0782',
      name: 'Jamie Jones',
    },
    service: 'Unlimited Extended License',
    total: 5200,
    avatar: avatar2,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-17`,
  },
  {
    id: 4999,
    issuedDate: `${now.getFullYear()}-${currentMonth}-14`,
    client: {
      address: '56381 Ashley Village Apt. 332',
      company: 'Hall, Thompson and Ramirez LLC',
      companyEmail: 'sean22@cook.com',
      country: 'Ukraine',
      contact: '(583) 470-8356',
      name: 'Ruben Garcia',
    },
    service: 'Software Development',
    total: 4558,
    avatar: avatar1,
    invoiceStatus: 'Paid',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-01`,
  },
  {
    id: 5000,
    issuedDate: `${now.getFullYear()}-${currentMonth}-21`,
    client: {
      address: '6946 Gregory Plaza Apt. 310',
      company: 'Lambert-Thomas Group',
      companyEmail: 'mccoymatthew@lopez-jenkins.net',
      country: 'Vanuatu',
      contact: '(366) 906-6467',
      name: 'Ryan Meyer',
    },
    service: 'Template Customization',
    total: 3503,
    avatar: avatar7,
    invoiceStatus: 'Paid',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-22`,
  },
  {
    id: 5001,
    issuedDate: `${now.getFullYear()}-${currentMonth}-30`,
    client: {
      address: '64351 Andrew Lights',
      company: 'Gregory-Haynes PLC',
      companyEmail: 'novakshannon@mccarty-murillo.com',
      country: 'Romania',
      contact: '(320) 616-3915',
      name: 'Valerie Valdez',
    },
    service: 'Unlimited Extended License',
    total: 5285,
    avatar: avatar6,
    invoiceStatus: 'Partial Payment',
    balance: -202,
    dueDate: `${now.getFullYear()}-${currentMonth}-02`,
  },
  {
    id: 5002,
    issuedDate: `${now.getFullYear()}-${currentMonth}-21`,
    client: {
      address: '5702 Sarah Heights',
      company: 'Wright-Schmidt LLC',
      companyEmail: 'smithrachel@davis-rose.net',
      country: 'Costa Rica',
      contact: '(435) 899-1963',
      name: 'Melissa Wheeler',
    },
    service: 'UI/UX Design & Development',
    total: 3668,
    avatar: avatar5,
    invoiceStatus: 'Downloaded',
    balance: 731,
    dueDate: `${now.getFullYear()}-${currentMonth}-15`,
  },
  {
    id: 5003,
    issuedDate: `${now.getFullYear()}-${currentMonth}-30`,
    client: {
      address: '668 Robert Flats',
      company: 'Russell-Abbott Ltd',
      companyEmail: 'scott96@mejia.net',
      country: 'Congo',
      contact: '(254) 399-4728',
      name: 'Alan Jimenez',
    },
    service: 'Unlimited Extended License',
    total: 4372,
    avatar: '',
    invoiceStatus: 'Sent',
    balance: -344,
    dueDate: `${now.getFullYear()}-${currentMonth}-17`,
  },
  {
    id: 5004,
    issuedDate: `${now.getFullYear()}-${currentMonth}-27`,
    client: {
      address: '55642 Chang Extensions Suite 373',
      company: 'Williams LLC Inc',
      companyEmail: 'cramirez@ross-bass.biz',
      country: 'Saint Pierre and Miquelon',
      contact: '(648) 500-4338',
      name: 'Jennifer Morris',
    },
    service: 'Template Customization',
    total: 3198,
    avatar: avatar4,
    invoiceStatus: 'Partial Payment',
    balance: -253,
    dueDate: `${now.getFullYear()}-${currentMonth}-16`,
  },
  {
    id: 5005,
    issuedDate: `${now.getFullYear()}-${currentMonth}-30`,
    client: {
      address: '56694 Eric Orchard',
      company: 'Hudson, Bell and Phillips PLC',
      companyEmail: 'arielberg@wolfe-smith.com',
      country: 'Uruguay',
      contact: '(896) 544-3796',
      name: 'Timothy Stevenson',
    },
    service: 'Unlimited Extended License',
    total: 5293,
    avatar: '',
    invoiceStatus: 'Past Due',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-01`,
  },
  {
    id: 5006,
    issuedDate: `${now.getFullYear()}-${currentMonth}-10`,
    client: {
      address: '3727 Emma Island Suite 879',
      company: 'Berry, Gonzalez and Heath Inc',
      companyEmail: 'yrobinson@nichols.com',
      country: 'Israel',
      contact: '(236) 784-5142',
      name: 'Erik Hayden',
    },
    service: 'Template Customization',
    total: 5612,
    avatar: avatar3,
    invoiceStatus: 'Downloaded',
    balance: 883,
    dueDate: `${now.getFullYear()}-${currentMonth}-12`,
  },
  {
    id: 5007,
    issuedDate: `${now.getFullYear()}-${currentMonth}-01`,
    client: {
      address: '953 Miller Common Suite 580',
      company: 'Martinez, Fuller and Chavez and Sons',
      companyEmail: 'tatejennifer@allen.net',
      country: 'Cook Islands',
      contact: '(436) 717-2419',
      name: 'Katherine Kennedy',
    },
    service: 'Software Development',
    total: 2230,
    avatar: avatar2,
    invoiceStatus: 'Sent',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-19`,
  },
  {
    id: 5008,
    issuedDate: `${now.getFullYear()}-${currentMonth}-22`,
    client: {
      address: '808 Sullivan Street Apt. 135',
      company: 'Wilson and Sons LLC',
      companyEmail: 'gdurham@lee.com',
      country: 'Nepal',
      contact: '(489) 946-3041',
      name: 'Monica Fuller',
    },
    service: 'Unlimited Extended License',
    total: 2032,
    avatar: avatar1,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-30`,
  },
  {
    id: 5009,
    issuedDate: `${now.getFullYear()}-${currentMonth}-30`,
    client: {
      address: '25135 Christopher Creek',
      company: 'Hawkins, Johnston and Mcguire PLC',
      companyEmail: 'jenny96@lawrence-thompson.com',
      country: 'Kiribati',
      contact: '(274) 246-3725',
      name: 'Stacey Carter',
    },
    service: 'UI/UX Design & Development',
    total: 3128,
    avatar: avatar8,
    invoiceStatus: 'Paid',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-10`,
  },
  {
    id: 5010,
    issuedDate: `${now.getFullYear()}-${currentMonth}-06`,
    client: {
      address: '81285 Rebecca Estates Suite 046',
      company: 'Huynh-Mills and Sons',
      companyEmail: 'jgutierrez@jackson.com',
      country: 'Swaziland',
      contact: '(258) 211-5970',
      name: 'Chad Davis',
    },
    service: 'Software Development',
    total: 2060,
    avatar: avatar7,
    invoiceStatus: 'Downloaded',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-08`,
  },
  {
    id: 5011,
    issuedDate: `${now.getFullYear()}-${currentMonth}-01`,
    client: {
      address: '3102 Briggs Dale Suite 118',
      company: 'Jones-Cooley and Sons',
      companyEmail: 'hunter14@jones.com',
      country: 'Congo',
      contact: '(593) 965-4100',
      name: 'Chris Reyes',
    },
    service: 'UI/UX Design & Development',
    total: 4077,
    avatar: '',
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-01`,
  },
  {
    id: 5012,
    issuedDate: `${now.getFullYear()}-${currentMonth}-30`,
    client: {
      address: '811 Jill Skyway',
      company: 'Jones PLC Ltd',
      companyEmail: 'pricetodd@johnson-jenkins.com',
      country: 'Brazil',
      contact: '(585) 829-2603',
      name: 'Laurie Summers',
    },
    service: 'Template Customization',
    total: 2872,
    avatar: avatar6,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-18`,
  },
  {
    id: 5013,
    issuedDate: `${now.getFullYear()}-${currentMonth}-05`,
    client: {
      address: '2223 Brandon Inlet Suite 597',
      company: 'Jordan, Gomez and Ross Group',
      companyEmail: 'perrydavid@chapman-rogers.com',
      country: 'Congo',
      contact: '(527) 351-5517',
      name: 'Lindsay Wilson',
    },
    service: 'Software Development',
    total: 3740,
    avatar: avatar4,
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-01`,
  },
  {
    id: 5014,
    issuedDate: `${now.getFullYear()}-${currentMonth}-01`,
    client: {
      address: '08724 Barry Causeway',
      company: 'Gonzalez, Moody and Glover LLC',
      companyEmail: 'leahgriffin@carpenter.com',
      country: 'Equatorial Guinea',
      contact: '(628) 903-0132',
      name: 'Jenna Castro',
    },
    service: 'Unlimited Extended License',
    total: 3623,
    avatar: '',
    invoiceStatus: 'Downloaded',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-23`,
  },
  {
    id: 5015,
    issuedDate: `${now.getFullYear()}-${currentMonth}-16`,
    client: {
      address: '073 Holt Ramp Apt. 755',
      company: 'Ashley-Pacheco Ltd',
      companyEmail: 'esparzadaniel@allen.com',
      country: 'Seychelles',
      contact: '(847) 396-9904',
      name: 'Wendy Weber',
    },
    service: 'Software Development',
    total: 2477,
    avatar: avatar5,
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-01`,
  },
  {
    id: 5016,
    issuedDate: `${now.getFullYear()}-${currentMonth}-24`,
    client: {
      address: '984 Sherry Trail Apt. 953',
      company: 'Berry PLC Group',
      companyEmail: 'todd34@owens-morgan.com',
      country: 'Ireland',
      contact: '(852) 249-4539',
      name: 'April Yates',
    },
    service: 'Unlimited Extended License',
    total: 3904,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 951,
    dueDate: `${now.getFullYear()}-${currentMonth}-30`,
  },
  {
    id: 5017,
    issuedDate: `${now.getFullYear()}-${currentMonth}-24`,
    client: {
      address: '093 Jonathan Camp Suite 953',
      company: 'Allen Group Ltd',
      companyEmail: 'roydavid@bailey.com',
      country: 'Netherlands',
      contact: '(917) 984-2232',
      name: 'Daniel Marshall PhD',
    },
    service: 'UI/UX Design & Development',
    total: 3102,
    avatar: avatar3,
    invoiceStatus: 'Partial Payment',
    balance: -153,
    dueDate: `${now.getFullYear()}-${currentMonth}-25`,
  },
  {
    id: 5018,
    issuedDate: `${now.getFullYear()}-${currentMonth}-29`,
    client: {
      address: '4735 Kristie Islands Apt. 259',
      company: 'Chapman-Schneider LLC',
      companyEmail: 'baldwinjoel@washington.com',
      country: 'Cocos (Keeling) Islands',
      contact: '(670) 409-3703',
      name: 'Randy Rich',
    },
    service: 'UI/UX Design & Development',
    total: 2483,
    avatar: avatar2,
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-10`,
  },
  {
    id: 5019,
    issuedDate: `${now.getFullYear()}-${currentMonth}-07`,
    client: {
      address: '92218 Andrew Radial',
      company: 'Mcclure, Hernandez and Simon Ltd',
      companyEmail: 'psmith@morris.info',
      country: 'Macao',
      contact: '(646) 263-0257',
      name: 'Mrs. Jodi Chapman',
    },
    service: 'Unlimited Extended License',
    total: 2825,
    avatar: avatar1,
    invoiceStatus: 'Partial Payment',
    balance: -459,
    dueDate: `${now.getFullYear()}-${currentMonth}-14`,
  },
  {
    id: 5020,
    issuedDate: `${now.getFullYear()}-${currentMonth}-10`,
    client: {
      address: '2342 Michelle Valley',
      company: 'Hamilton PLC and Sons',
      companyEmail: 'lori06@morse.com',
      country: 'Somalia',
      contact: '(751) 213-4288',
      name: 'Steven Myers',
    },
    service: 'Unlimited Extended License',
    total: 2029,
    avatar: avatar2,
    invoiceStatus: 'Past Due',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-28`,
  },
  {
    id: 5021,
    issuedDate: `${now.getFullYear()}-${currentMonth}-02`,
    client: {
      address: '16039 Brittany Terrace Apt. 128',
      company: 'Silva-Reeves LLC',
      companyEmail: 'zpearson@miller.com',
      country: 'Slovakia (Slovak Republic)',
      contact: '(655) 649-7872',
      name: 'Charles Alexander',
    },
    service: 'Software Development',
    total: 3208,
    avatar: '',
    invoiceStatus: 'Sent',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-06`,
  },
  {
    id: 5022,
    issuedDate: `${now.getFullYear()}-${currentMonth}-02`,
    client: {
      address: '37856 Olsen Lakes Apt. 852',
      company: 'Solis LLC Ltd',
      companyEmail: 'strongpenny@young.net',
      country: 'Brazil',
      contact: '(402) 935-0735',
      name: 'Elizabeth Jones',
    },
    service: 'Software Development',
    total: 3077,
    avatar: '',
    invoiceStatus: 'Sent',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-09`,
  },
  {
    id: 5023,
    issuedDate: `${now.getFullYear()}-${currentMonth}-23`,
    client: {
      address: '11489 Griffin Plaza Apt. 927',
      company: 'Munoz-Peters and Sons',
      companyEmail: 'carrietorres@acosta.com',
      country: 'Argentina',
      contact: '(915) 448-6271',
      name: 'Heidi Walton',
    },
    service: 'Software Development',
    total: 5578,
    avatar: avatar4,
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-23`,
  },
  {
    id: 5024,
    issuedDate: `${now.getFullYear()}-${currentMonth}-28`,
    client: {
      address: '276 Michael Gardens Apt. 004',
      company: 'Shea, Velez and Garcia LLC',
      companyEmail: 'zjohnson@nichols-powers.com',
      country: 'Philippines',
      contact: '(817) 700-2984',
      name: 'Christopher Allen',
    },
    service: 'Software Development',
    total: 2787,
    avatar: avatar5,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-25`,
  },
  {
    id: 5025,
    issuedDate: `${now.getFullYear()}-${currentMonth}-21`,
    client: {
      address: '633 Bell Well Apt. 057',
      company: 'Adams, Simmons and Brown Group',
      companyEmail: 'kayla09@thomas.com',
      country: 'Martinique',
      contact: '(266) 611-9482',
      name: 'Joseph Oliver',
    },
    service: 'UI/UX Design & Development',
    total: 5591,
    avatar: '',
    invoiceStatus: 'Downloaded',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-07`,
  },
  {
    id: 5026,
    issuedDate: `${now.getFullYear()}-${currentMonth}-24`,
    client: {
      address: '1068 Lopez Fall',
      company: 'Williams-Lawrence and Sons',
      companyEmail: 'melvindavis@allen.info',
      country: 'Mexico',
      contact: '(739) 745-9728',
      name: 'Megan Roberts',
    },
    service: 'Template Customization',
    total: 2783,
    avatar: avatar6,
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-22`,
  },
  {
    id: 5027,
    issuedDate: `${now.getFullYear()}-${currentMonth}-13`,
    client: {
      address: '86691 Mackenzie Light Suite 568',
      company: 'Deleon Inc LLC',
      companyEmail: 'gjordan@fernandez-coleman.com',
      country: 'Costa Rica',
      contact: '(682) 804-6506',
      name: 'Mary Garcia',
    },
    service: 'Template Customization',
    total: 2719,
    avatar: '',
    invoiceStatus: 'Sent',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-04`,
  },
  {
    id: 5028,
    issuedDate: `${now.getFullYear()}-${currentMonth}-18`,
    client: {
      address: '86580 Sarah Bridge',
      company: 'Farmer, Johnson and Anderson Group',
      companyEmail: 'robertscott@garcia.com',
      country: 'Cameroon',
      contact: '(775) 366-0411',
      name: 'Crystal Mays',
    },
    service: 'Template Customization',
    total: 3325,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 361,
    dueDate: `${now.getFullYear()}-${currentMonth}-02`,
  },
  {
    id: 5029,
    issuedDate: `${now.getFullYear()}-${currentMonth}-29`,
    client: {
      address: '49709 Edwin Ports Apt. 353',
      company: 'Sherman-Johnson PLC',
      companyEmail: 'desiree61@kelly.com',
      country: 'Macedonia',
      contact: '(510) 536-6029',
      name: 'Nicholas Tanner',
    },
    service: 'Template Customization',
    total: 3851,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-25`,
  },
  {
    id: 5030,
    issuedDate: `${now.getFullYear()}-${currentMonth}-07`,
    client: {
      address: '3856 Mathis Squares Apt. 584',
      company: 'Byrd LLC PLC',
      companyEmail: 'jeffrey25@martinez-hodge.com',
      country: 'Congo',
      contact: '(253) 230-4657',
      name: 'Justin Richardson',
    },
    service: 'Template Customization',
    total: 5565,
    avatar: '',
    invoiceStatus: 'Draft',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-06`,
  },
  {
    id: 5031,
    issuedDate: `${now.getFullYear()}-${currentMonth}-21`,
    client: {
      address: '141 Adrian Ridge Suite 550',
      company: 'Stone-Zimmerman Group',
      companyEmail: 'john77@anderson.net',
      country: 'Falkland Islands (Malvinas)',
      contact: '(612) 546-3485',
      name: 'Jennifer Summers',
    },
    service: 'Template Customization',
    total: 3313,
    avatar: avatar7,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-09`,
  },
  {
    id: 5032,
    issuedDate: `${now.getFullYear()}-${currentMonth}-31`,
    client: {
      address: '01871 Kristy Square',
      company: 'Yang, Hansen and Hart PLC',
      companyEmail: 'ywagner@jones.com',
      country: 'Germany',
      contact: '(203) 601-8603',
      name: 'Richard Payne',
    },
    service: 'Template Customization',
    total: 5181,
    avatar: '',
    invoiceStatus: 'Past Due',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-29`,
  },
  {
    id: 5033,
    issuedDate: `${now.getFullYear()}-${currentMonth}-12`,
    client: {
      address: '075 Smith Views',
      company: 'Jenkins-Rosales Inc',
      companyEmail: 'calvin07@joseph-edwards.org',
      country: 'Colombia',
      contact: '(895) 401-4255',
      name: 'Lori Wells',
    },
    service: 'Template Customization',
    total: 2869,
    avatar: avatar4,
    invoiceStatus: 'Partial Payment',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-22`,
  },
  {
    id: 5034,
    issuedDate: `${now.getFullYear()}-${currentMonth}-10`,
    client: {
      address: '2577 Pearson Overpass Apt. 314',
      company: 'Mason-Reed PLC',
      companyEmail: 'eric47@george-castillo.com',
      country: 'Paraguay',
      contact: '(602) 336-9806',
      name: 'Tammy Sanchez',
    },
    service: 'Unlimited Extended License',
    total: 4836,
    avatar: '',
    invoiceStatus: 'Paid',
    balance: 0,
    dueDate: `${now.getFullYear()}-${currentMonth}-22`,
  },
  {
    id: 5035,
    issuedDate: `${now.getFullYear()}-${currentMonth}-20`,
    client: {
      address: '1770 Sandra Mountains Suite 636',
      company: 'Foster-Pham PLC',
      companyEmail: 'jamesjoel@chapman.net',
      country: 'Western Sahara',
      contact: '(936) 550-1638',
      name: 'Dana Carey',
    },
    service: 'UI/UX Design & Development',
    total: 4263,
    avatar: '',
    invoiceStatus: 'Draft',
    balance: 762,
    dueDate: `${now.getFullYear()}-${currentMonth}-12`,
  },
  {
    id: 5036,
    issuedDate: `${now.getFullYear()}-${currentMonth}-19`,
    client: {
      address: '78083 Laura Pines',
      company: 'Richardson and Sons LLC',
      companyEmail: 'pwillis@cross.org',
      country: 'Bhutan',
      contact: '(687) 660-2473',
      name: 'Andrew Burns',
    },
    service: 'Unlimited Extended License',
    total: 3171,
    avatar: avatar3,
    invoiceStatus: 'Paid',
    balance: -205,
    dueDate: `${now.getFullYear()}-${currentMonth}-25`,
  },
]


// 👉 Get invoice list
// eslint-disable-next-line sonarjs/cognitive-complexity
mock.onGet('/apps/invoices').reply(config => {
  const { q = '', status = null, startDate = '', endDate = '', options = {} } = config.params ?? {}
  const { sortBy = '', page = 1, itemsPerPage = 10 } = options
  const sort = JSON.parse(JSON.stringify(sortBy))
  const queryLowered = q.toLowerCase()

  // Filtering invoices
  let filteredInvoices = database.filter(invoice => ((invoice.client.name.toLowerCase().includes(queryLowered)
        || invoice.client.companyEmail.toLowerCase().includes(queryLowered)
        || invoice.total.toString().includes(queryLowered)
        || invoice.issuedDate.toString().includes(queryLowered)
        || invoice.id.toString().includes(queryLowered))
        && invoice.invoiceStatus === (status || invoice.invoiceStatus))).reverse()

  // Sorting invoices
  if (sort.length) {
    if (sort[0]?.key === 'client') {
      filteredInvoices = filteredInvoices.sort((a, b) => {
        if (sort[0]?.order === 'asc')
          return a.client.name.localeCompare(b.client.name)
        
        return b.client.name.localeCompare(a.client.name)
      })
    }
    else if (sort[0]?.key === 'total') {
      filteredInvoices = filteredInvoices.sort((a, b) => {
        if (sort[0]?.order === 'asc')
          return a.total - b.total
        
        return b.total - a.total
      })
    }
    else if (sort[0]?.key === 'id') {
      filteredInvoices = filteredInvoices.sort((a, b) => {
        if (sort[0]?.order === 'asc')
          return a.id - b.id
        
        return b.id - a.id
      })
    }
    else if (sort[0]?.key === 'date') {
      filteredInvoices = filteredInvoices.sort((a, b) => {
        if (sort[0]?.order === 'asc')
          return new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime()
        
        return new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
      })
    }
    else if (sort[0]?.key === 'balance') {
      filteredInvoices = filteredInvoices.sort((a, b) => {
        if (sort[0]?.order === 'asc')
          return a.balance - b.balance
        
        return b.balance - a.balance
      })
    }
  }

  // filtering invoices by date
  if (startDate && endDate) {
    filteredInvoices = filteredInvoices.filter(invoiceObj => {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      const issuedDate = new Date(invoiceObj.issuedDate).getTime()
      
      return issuedDate >= start && issuedDate <= end
    })
  }
  const totalInvoices = filteredInvoices.length
  
  return [200, { invoices: paginateArray(filteredInvoices, itemsPerPage, page), totalInvoices, page: page > Math.ceil(totalInvoices / itemsPerPage) ? 1 : page }]
})

// 👉 Get a single invoice
mock.onGet(/\/apps\/invoices\/\d+/).reply(config => {
  // Get event id from URL
  const invoiceId = config.url?.substring(config.url.lastIndexOf('/') + 1)

  // Convert Id to number
  const id = Number(invoiceId)
  const invoice = database.find(e => e.id === id)
  if (!invoice)
    return [404, { message: 'Unable to find the requested invoice' }]

  const responseData = {
    invoice,
    paymentDetails: {
      totalDue: '$12,110.55',
      bankName: 'American Bank',
      country: 'United States',
      iban: 'ETD95476213874685',
      swiftCode: 'BR91905',
    },
  }

  return [200, responseData]
})

// 👉 Get Client
mock.onGet('/apps/invoice/clients').reply(() => {
  const clients = database.map(invoice => invoice.client)
  
  return [200, clients.slice(0, 5)]
})

// 👉 Delete Invoice
mock.onDelete(/\/apps\/invoices\/\d+/).reply(config => {
  // Get event id from URL
  const invoiceId = config.url?.substring(config.url.lastIndexOf('/') + 1)

  // Convert Id to number
  const id = Number(invoiceId)
  const invoiceIndex = database.findIndex(e => e.id === id)
  if (invoiceIndex >= 0) {
    database.splice(invoiceIndex, 1)
    
    return [200]
  }
  
  return [400]
})
