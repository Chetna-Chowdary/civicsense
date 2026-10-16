import { GrievanceRecord } from '../types';

export const INITIAL_DEMO_GRIEVANCES: GrievanceRecord[] = [
  // --- ROADS ---
  {
    id: "GRV-2026-001",
    complaint_text: "Deep potholes on Bowrampet Main Road are causing severe vehicular accidents during nighttime.",
    category: "Roads",
    sentiment: "Negative",
    date: "2026-08-01",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Municipal Roads Division",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-004",
    complaint_text: "Sincere gratitude to the road maintenance team for quickly resurfacing the damaged asphalt road near the school.",
    category: "Roads",
    sentiment: "Positive",
    date: "2026-08-02",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Municipal Roads Division",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-005",
    complaint_text: "What is the scheduled timeline and contractor details for the upcoming flyover construction project?",
    category: "Roads",
    sentiment: "Neutral",
    date: "2026-08-03",
    ward_or_region: "Ward 01 - Central",
    department: "Highways & Bridges",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-025",
    complaint_text: "Manhole cover left uncovered on pedestrian pavement near busy bus stop, risking life and limb of walkers.",
    category: "Roads",
    sentiment: "Negative",
    date: "2026-08-13",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Municipal Roads Division",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-026",
    complaint_text: "Speed breakers recently constructed on the hospital lane have successfully prevented reckless overspeeding.",
    category: "Roads",
    sentiment: "Positive",
    date: "2026-08-13",
    ward_or_region: "Ward 15 - North",
    department: "Traffic & Roads",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-047",
    complaint_text: "Newly paved concrete road in industrial corridor has greatly reduced vehicle wear and transit time.",
    category: "Roads",
    sentiment: "Positive",
    date: "2026-08-24",
    ward_or_region: "Ward 09 - Bachupally",
    department: "Industrial Infra Corp",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-048",
    complaint_text: "When will the annual asphalt re-carpeting schedule for Sector 4 internal lanes be executed?",
    category: "Roads",
    sentiment: "Neutral",
    date: "2026-08-24",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Municipal Roads Division",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-067",
    complaint_text: "Severe road caving after heavy downpour created a dangerous 4-foot sinkhole on bypass junction.",
    category: "Roads",
    sentiment: "Negative",
    date: "2026-09-03",
    ward_or_region: "Ward 02 - Highway",
    department: "Municipal Roads Division",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-068",
    complaint_text: "Quick patching of asphalt cracks on the bridge ramp has made driving smooth and accident free.",
    category: "Roads",
    sentiment: "Positive",
    date: "2026-09-03",
    ward_or_region: "Ward 01 - Central",
    department: "Highways & Bridges",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-088",
    complaint_text: "Dangerous open trench dug up for cable laying left unbarricaded without warning signs for 10 days.",
    category: "Roads",
    sentiment: "Negative",
    date: "2026-09-13",
    ward_or_region: "Ward 06 - East",
    department: "Telecom & Roads Liaison",
    status: "In Progress",
    urgency: "High"
  },

  // --- WATER SUPPLY ---
  {
    id: "GRV-2026-002",
    complaint_text: "Contaminated muddy water flowing through residential drinking taps for the past three consecutive days.",
    category: "Water Supply",
    sentiment: "Negative",
    date: "2026-08-01",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Water Supply & Sewerage",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-010",
    complaint_text: "The new 24x7 clean piped water connection has significantly reduced our daily struggles. Excellent initiative.",
    category: "Water Supply",
    sentiment: "Positive",
    date: "2026-08-05",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Water Supply & Sewerage",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-016",
    complaint_text: "Drinking water distribution pipeline burst near market intersection, wasting thousands of liters of treated water.",
    category: "Water Supply",
    sentiment: "Negative",
    date: "2026-08-08",
    ward_or_region: "Ward 03 - Market",
    department: "Water Supply & Sewerage",
    status: "In Progress",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-028",
    complaint_text: "No drinking water supply received in our housing society for 5 consecutive days; private water tankers are exploiting residents.",
    category: "Water Supply",
    sentiment: "Negative",
    date: "2026-08-14",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Water Supply & Sewerage",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-029",
    complaint_text: "Thank you for fixing the overhead drinking water tank leakage promptly after our first complaint last week.",
    category: "Water Supply",
    sentiment: "Positive",
    date: "2026-08-15",
    ward_or_region: "Ward 16 - Central",
    department: "Water Supply & Sewerage",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-030",
    complaint_text: "Inquiry regarding residential water meter billing cycle and procedure to dispute an unexpectedly inflated water bill.",
    category: "Water Supply",
    sentiment: "Neutral",
    date: "2026-08-15",
    ward_or_region: "Ward 16 - Central",
    department: "Water Supply & Sewerage",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-050",
    complaint_text: "Timely water valve maintenance ensured stable drinking water pressure up to third floor apartments without motors.",
    category: "Water Supply",
    sentiment: "Positive",
    date: "2026-08-25",
    ward_or_region: "Ward 16 - Central",
    department: "Water Supply & Sewerage",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-070",
    complaint_text: "Water pipeline pressure is extremely low, barely filling half a bucket after waiting for 2 hours.",
    category: "Water Supply",
    sentiment: "Negative",
    date: "2026-09-04",
    ward_or_region: "Ward 03 - Market",
    department: "Water Supply & Sewerage",
    status: "Open",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-071",
    complaint_text: "Installing solar-powered water purification RO kiosk in our village provides excellent clean drinking water.",
    category: "Water Supply",
    sentiment: "Positive",
    date: "2026-09-05",
    ward_or_region: "Ward 20 - Rural",
    department: "Rural Water & Sanitation",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-091",
    complaint_text: "Chlorination level in municipal tap drinking water is dangerously high, causing burning sensation in eyes and throat.",
    category: "Water Supply",
    sentiment: "Negative",
    date: "2026-09-15",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Water Supply & Sewerage",
    status: "Open",
    urgency: "High"
  },

  // --- DRAINAGE / SEWAGE ---
  {
    id: "GRV-2026-009",
    complaint_text: "Blocked underground drainage pipeline is overflowing onto the street with unbearable sewage odor.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-08-05",
    ward_or_region: "Ward 06 - East",
    department: "Drainage & Sewerage Board",
    status: "In Progress",
    urgency: "High"
  },
  {
    id: "GRV-2026-027",
    complaint_text: "Requesting status update on the tender proposal for laying storm water underground drainage pipes in Ward 6.",
    category: "Drainage / Sewage",
    sentiment: "Neutral",
    date: "2026-08-14",
    ward_or_region: "Ward 06 - East",
    department: "Drainage & Sewerage Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-046",
    complaint_text: "Severe waterlogging caused by clogged storm drainage culverts traps vehicles and submerges the subway.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-08-23",
    ward_or_region: "Ward 01 - Central",
    department: "Drainage & Sewerage Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-049",
    complaint_text: "Broken underground sewage line leaking black foul-smelling sewer waste into residential basement drains.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-08-25",
    ward_or_region: "Ward 14 - East",
    department: "Drainage & Sewerage Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-085",
    complaint_text: "Open sewage gutter overflowing directly onto main market road, spreading intolerable stench and toxic wastewater.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-09-12",
    ward_or_region: "Ward 03 - Market",
    department: "Drainage & Sewerage Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-101",
    complaint_text: "Municipal drain cleaning suction team cleared the blocked main sewer line promptly within 6 hours. Great service.",
    category: "Drainage / Sewage",
    sentiment: "Positive",
    date: "2026-09-20",
    ward_or_region: "Ward 08 - South",
    department: "Drainage & Sewerage Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-102",
    complaint_text: "Sewage manholes are bubbling and backflowing into ground floor bathrooms during heavy rain showers.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-09-21",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Drainage & Sewerage Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-103",
    complaint_text: "What is the schedule for pre-monsoon desilting of stormwater drains and open sewage channels?",
    category: "Drainage / Sewage",
    sentiment: "Neutral",
    date: "2026-09-22",
    ward_or_region: "Ward 05 - Civic Center",
    department: "Drainage & Sewerage Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-104",
    complaint_text: "Damaged drainage cover broken by heavy trucks, creating an open sewage hazard right in front of pedestrian walkway.",
    category: "Drainage / Sewage",
    sentiment: "Negative",
    date: "2026-09-23",
    ward_or_region: "Ward 10 - Colony",
    department: "Drainage & Sewerage Board",
    status: "In Progress",
    urgency: "High"
  },
  {
    id: "GRV-2026-105",
    complaint_text: "Appreciation to the sanitary drainage team for constructing proper RCC covers over the open roadside drain.",
    category: "Drainage / Sewage",
    sentiment: "Positive",
    date: "2026-09-24",
    ward_or_region: "Ward 15 - North",
    department: "Drainage & Sewerage Board",
    status: "Resolved",
    urgency: "Low"
  },

  // --- ELECTRICITY ---
  {
    id: "GRV-2026-003",
    complaint_text: "Frequent unscheduled power cuts exceeding 4 hours daily in Bachupally industrial area.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-08-02",
    ward_or_region: "Ward 09 - Bachupally",
    department: "State Electricity Board",
    status: "In Progress",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-011",
    complaint_text: "Please provide information on how to apply for a subsidized solar rooftop net metering connection.",
    category: "Electricity",
    sentiment: "Neutral",
    date: "2026-08-06",
    ward_or_region: "Ward 09 - Bachupally",
    department: "Renewable Energy Cell",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-012",
    complaint_text: "High voltage fluctuation damaged refrigerators and LED streetlights across the street yesterday.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-08-06",
    ward_or_region: "Ward 14 - East",
    department: "State Electricity Board",
    status: "In Progress",
    urgency: "High"
  },
  {
    id: "GRV-2026-015",
    complaint_text: "Broken streetlights on the highway bypass road have made travel hazardous for two-wheelers after sunset.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-08-08",
    ward_or_region: "Ward 02 - Highway",
    department: "Urban Municipal Corp",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-031",
    complaint_text: "Substation transformer caught fire; entire sector has been in total darkness for more than 16 hours.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-08-16",
    ward_or_region: "Ward 09 - Bachupally",
    department: "State Electricity Board",
    status: "In Progress",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-032",
    complaint_text: "Prompt restoration of electricity line within 30 minutes of wire snapping was very impressive and safe.",
    category: "Electricity",
    sentiment: "Positive",
    date: "2026-08-16",
    ward_or_region: "Ward 09 - Bachupally",
    department: "State Electricity Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-033",
    complaint_text: "Need clarification on commercial versus domestic electricity tariff rates for small home tuition centres.",
    category: "Electricity",
    sentiment: "Neutral",
    date: "2026-08-17",
    ward_or_region: "Ward 07 - West",
    department: "State Electricity Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-052",
    complaint_text: "Exposed dangling electrical wire hanging dangerously low over footpath near children playground.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-08-26",
    ward_or_region: "Ward 10 - Colony",
    department: "State Electricity Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-053",
    complaint_text: "Energy efficient LED streetlight installation has completely illuminated previously dark alleyways.",
    category: "Electricity",
    sentiment: "Positive",
    date: "2026-08-27",
    ward_or_region: "Ward 06 - East",
    department: "Urban Municipal Corp",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-073",
    complaint_text: "Frequent power tripping in the evening hours causes internet routers and computer systems to shut down.",
    category: "Electricity",
    sentiment: "Negative",
    date: "2026-09-06",
    ward_or_region: "Ward 09 - Bachupally",
    department: "State Electricity Board",
    status: "Open",
    urgency: "Medium"
  },

  // --- HEALTHCARE ---
  {
    id: "GRV-2026-006",
    complaint_text: "Acute shortage of basic life-saving medicines and antivenom vials in the primary community healthcare clinic.",
    category: "Healthcare",
    sentiment: "Negative",
    date: "2026-08-03",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-013",
    complaint_text: "Doctors and nursing staff at the civil hospital pediatric ward were extremely compassionate and professional.",
    category: "Healthcare",
    sentiment: "Positive",
    date: "2026-08-07",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-014",
    complaint_text: "Inquiry regarding the vaccination drive schedule for booster shots and child immunizations.",
    category: "Healthcare",
    sentiment: "Neutral",
    date: "2026-08-07",
    ward_or_region: "Ward 08 - South",
    department: "Public Health Services",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-034",
    complaint_text: "Ultrasound and ECG diagnostic equipment at the community hospital has been non-functional for three weeks.",
    category: "Healthcare",
    sentiment: "Negative",
    date: "2026-08-17",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-035",
    complaint_text: "Free medical eye checkup camp organized by municipal health department in rural ward was immensely helpful.",
    category: "Healthcare",
    sentiment: "Positive",
    date: "2026-08-18",
    ward_or_region: "Ward 20 - Rural",
    department: "Public Health Services",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-055",
    complaint_text: "Long queues and rude behavior by billing counter clerks at government super-specialty hospital.",
    category: "Healthcare",
    sentiment: "Negative",
    date: "2026-08-28",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Open",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-056",
    complaint_text: "Free cataract surgeries conducted at the district hospital restored vision for my mother. Truly grateful.",
    category: "Healthcare",
    sentiment: "Positive",
    date: "2026-08-28",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-076",
    complaint_text: "Severe shortage of specialized pediatricians and gynecologists in community healthcare center.",
    category: "Healthcare",
    sentiment: "Negative",
    date: "2026-09-07",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-077",
    complaint_text: "Prompt ambulance dispatch within 12 minutes saved a cardiac patient's life in our colony today.",
    category: "Healthcare",
    sentiment: "Positive",
    date: "2026-09-08",
    ward_or_region: "Ward 10 - Colony",
    department: "Emergency Ambulance 108",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-097",
    complaint_text: "Government dialysis center has 4 machines out of order; kidney failure patients turned away without care.",
    category: "Healthcare",
    sentiment: "Negative",
    date: "2026-09-18",
    ward_or_region: "Ward 15 - North",
    department: "Public Health Services",
    status: "Open",
    urgency: "Critical"
  },

  // --- EDUCATION ---
  {
    id: "GRV-2026-007",
    complaint_text: "Government high school classrooms are leaking severely during monsoon rains, damaging desks and books.",
    category: "Education",
    sentiment: "Negative",
    date: "2026-08-04",
    ward_or_region: "Ward 07 - West",
    department: "School Education Board",
    status: "In Progress",
    urgency: "High"
  },
  {
    id: "GRV-2026-017",
    complaint_text: "New computer lab and digital smartboards installed in the government secondary school are wonderful.",
    category: "Education",
    sentiment: "Positive",
    date: "2026-08-09",
    ward_or_region: "Ward 07 - West",
    department: "School Education Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-018",
    complaint_text: "Can the education department clarify the eligibility guidelines and documents required for scholarship reimbursement?",
    category: "Education",
    sentiment: "Neutral",
    date: "2026-08-09",
    ward_or_region: "Ward 11 - Central",
    department: "Higher Education Dept",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-037",
    complaint_text: "Primary government school has no dedicated female sanitation toilets, causing high girl student dropouts.",
    category: "Education",
    sentiment: "Negative",
    date: "2026-08-19",
    ward_or_region: "Ward 07 - West",
    department: "School Education Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-038",
    complaint_text: "Mid-day meal quality has improved significantly with hot nutritious meals served to elementary children.",
    category: "Education",
    sentiment: "Positive",
    date: "2026-08-19",
    ward_or_region: "Ward 07 - West",
    department: "School Education Board",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-058",
    complaint_text: "Government polytechnic college laboratory has outdated equipment from 2005 and no trained lab assistant.",
    category: "Education",
    sentiment: "Negative",
    date: "2026-08-29",
    ward_or_region: "Ward 11 - Central",
    department: "Technical Education",
    status: "Open",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-059",
    complaint_text: "Career counselling and competitive exam guidance session organized in government college was outstanding.",
    category: "Education",
    sentiment: "Positive",
    date: "2026-08-30",
    ward_or_region: "Ward 11 - Central",
    department: "Higher Education Dept",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-079",
    complaint_text: "Teachers in government primary school are frequently absent; students left unattended throughout the day.",
    category: "Education",
    sentiment: "Negative",
    date: "2026-09-09",
    ward_or_region: "Ward 20 - Rural",
    department: "School Education Board",
    status: "Open",
    urgency: "Critical"
  },
  {
    id: "GRV-2026-080",
    complaint_text: "State merit scholarship funds credited on time to students bank accounts, enabling college enrollment.",
    category: "Education",
    sentiment: "Positive",
    date: "2026-09-09",
    ward_or_region: "Ward 11 - Central",
    department: "Higher Education Dept",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-100",
    complaint_text: "Dilapidated ceiling plaster collapsed in primary school classroom; thankfully happened after school hours.",
    category: "Education",
    sentiment: "Negative",
    date: "2026-09-19",
    ward_or_region: "Ward 07 - West",
    department: "School Education Board",
    status: "Open",
    urgency: "Critical"
  },

  // --- TRANSPORTATION ---
  {
    id: "GRV-2026-008",
    complaint_text: "Public bus route 219 is chronically delayed by over 45 minutes every morning, stranding daily commuters.",
    category: "Transportation",
    sentiment: "Negative",
    date: "2026-08-04",
    ward_or_region: "Ward 18 - South",
    department: "State Road Transport",
    status: "Open",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-019",
    complaint_text: "Bus conductors are overcharging passengers and refusing to issue digital tickets on government feeder buses.",
    category: "Transportation",
    sentiment: "Negative",
    date: "2026-08-10",
    ward_or_region: "Ward 18 - South",
    department: "State Road Transport",
    status: "Open",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-020",
    complaint_text: "Introduction of the new electric AC city bus service on Outer Ring Road is very comfortable and punctual.",
    category: "Transportation",
    sentiment: "Positive",
    date: "2026-08-10",
    ward_or_region: "Ward 13 - Ring Road",
    department: "State Road Transport",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-021",
    complaint_text: "Requesting updated timetable for intercity express bus departures from the central terminal station.",
    category: "Transportation",
    sentiment: "Neutral",
    date: "2026-08-11",
    ward_or_region: "Ward 01 - Central",
    department: "State Road Transport",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-040",
    complaint_text: "Traffic signals at the major intersection have been erratic, causing two-hour gridlocks and near collisions.",
    category: "Transportation",
    sentiment: "Negative",
    date: "2026-08-20",
    ward_or_region: "Ward 02 - Highway",
    department: "Traffic Police & Roads",
    status: "In Progress",
    urgency: "High"
  },
  {
    id: "GRV-2026-041",
    complaint_text: "New zebra crossings and pedestrian safety signals installed near the university gate have made crossing very safe.",
    category: "Transportation",
    sentiment: "Positive",
    date: "2026-08-21",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Traffic & Roads",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-061",
    complaint_text: "State transport buses do not stop at designated village stops, forcing female students to walk 4 km.",
    category: "Transportation",
    sentiment: "Negative",
    date: "2026-08-31",
    ward_or_region: "Ward 20 - Rural",
    department: "State Road Transport",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-062",
    complaint_text: "GPS vehicle tracking feature in the newly launched state bus mobile app is extremely accurate and convenient.",
    category: "Transportation",
    sentiment: "Positive",
    date: "2026-08-31",
    ward_or_region: "Ward 01 - Central",
    department: "State Road Transport",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-082",
    complaint_text: "Reckless private tanker drivers speeding on narrow residential roads; urgent speed bump required.",
    category: "Transportation",
    sentiment: "Negative",
    date: "2026-09-10",
    ward_or_region: "Ward 12 - Bowrampet",
    department: "Traffic Police & Roads",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-083",
    complaint_text: "Renovated bus shelters with digital arrival countdown displays and seating have improved passenger comfort.",
    category: "Transportation",
    sentiment: "Positive",
    date: "2026-09-11",
    ward_or_region: "Ward 01 - Central",
    department: "State Road Transport",
    status: "Resolved",
    urgency: "Low"
  },

  // --- OTHER PUBLIC SERVICES ---
  {
    id: "GRV-2026-022",
    complaint_text: "Birth certificate application has been pending verification at the municipal ward office for over 35 days.",
    category: "Other Public Services",
    sentiment: "Negative",
    date: "2026-08-11",
    ward_or_region: "Ward 05 - Civic Center",
    department: "Revenue & Citizen Services",
    status: "In Progress",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-023",
    complaint_text: "Park maintenance crew promptly cleaned and trimmed trees in the community park following thunderstorm damage.",
    category: "Other Public Services",
    sentiment: "Positive",
    date: "2026-08-12",
    ward_or_region: "Ward 10 - Colony",
    department: "Parks & Recreation",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-024",
    complaint_text: "What is the procedure and required fee structure for registering a pet dog with the municipal corporation?",
    category: "Other Public Services",
    sentiment: "Neutral",
    date: "2026-08-12",
    ward_or_region: "Ward 10 - Colony",
    department: "Veterinary & Sanitation",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-043",
    complaint_text: "Stray dogs menace in our residential neighborhood has made it unsafe for elderly citizens and children to walk.",
    category: "Other Public Services",
    sentiment: "Negative",
    date: "2026-08-22",
    ward_or_region: "Ward 10 - Colony",
    department: "Animal Control Unit",
    status: "Open",
    urgency: "High"
  },
  {
    id: "GRV-2026-044",
    complaint_text: "Appreciation to the grievance portal staff for resolving trade license renewal within 48 hours without hassle.",
    category: "Other Public Services",
    sentiment: "Positive",
    date: "2026-08-22",
    ward_or_region: "Ward 05 - Civic Center",
    department: "Revenue & Citizen Services",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-045",
    complaint_text: "Can you provide the working hours and documentation required for property tax name mutation?",
    category: "Other Public Services",
    sentiment: "Neutral",
    date: "2026-08-23",
    ward_or_region: "Ward 05 - Civic Center",
    department: "Property Tax Wing",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-064",
    complaint_text: "Public park walking track is covered in broken alcohol glass bottles and overgrown thorny bushes.",
    category: "Other Public Services",
    sentiment: "Negative",
    date: "2026-09-01",
    ward_or_region: "Ward 10 - Colony",
    department: "Parks & Recreation",
    status: "In Progress",
    urgency: "Medium"
  },
  {
    id: "GRV-2026-065",
    complaint_text: "Door-to-door solid waste collection vehicle arrives on time every morning with polite sanitation workers.",
    category: "Other Public Services",
    sentiment: "Positive",
    date: "2026-09-02",
    ward_or_region: "Ward 04 - Gandimaisamma",
    department: "Solid Waste Management",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-086",
    complaint_text: "Online birth and death certificate issuance portal is remarkably fast, certificate received in 15 minutes.",
    category: "Other Public Services",
    sentiment: "Positive",
    date: "2026-09-12",
    ward_or_region: "Ward 05 - Civic Center",
    department: "E-Governance Cell",
    status: "Resolved",
    urgency: "Low"
  },
  {
    id: "GRV-2026-087",
    complaint_text: "How can a citizen request fire safety compliance inspection for a multi-tenant commercial complex?",
    category: "Other Public Services",
    sentiment: "Neutral",
    date: "2026-09-13",
    ward_or_region: "Ward 01 - Central",
    department: "Fire & Disaster Safety",
    status: "Resolved",
    urgency: "Low"
  }
];
