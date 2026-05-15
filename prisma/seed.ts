import {
  PrismaClient,
  UserRole,
  Region,
  Elevation,
  Grade,
  LotStatus,
  TastingStatus,
  ResultStatus,
  LiquorBrightness,
  LiquorStrength,
  LiquorBriskness,
  LiquorFlavor,
  LiquorAroma,
  OverallQuality,
} from "@prisma/client"
import { hash } from "bcryptjs"
import { subWeeks, addDays, startOfWeek } from "date-fns"

const prisma = new PrismaClient()

const ESTATES = [
  { name: "Kenilworth", region: Region.NuwaraEliya, elevation: Elevation.HG },
  { name: "Dimbula Valley", region: Region.Dimbula, elevation: Elevation.HG },
  { name: "Uva Highlands", region: Region.Uva, elevation: Elevation.MG },
  { name: "Sabaragamuwa Select", region: Region.Sabaragamuwa, elevation: Elevation.LG },
  { name: "Kandy Crown", region: Region.Kandy, elevation: Elevation.MG },
]

const GRADES: Grade[] = [Grade.BOP, Grade.BOPF, Grade.OP, Grade.Dust1]

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Base prices per grade (LKR/kg)
const BASE_PRICES: Record<Grade, number> = {
  BOP: 950,
  BOPF: 850,
  OP: 1050,
  OP1: 1000,
  OPA: 1000,
  Pekoe: 900,
  Dust1: 780,
  Dust: 750,
  BF: 700,
  FNGS1: 720,
  FNGS: 700,
  PD: 680,
  PEK: 860,
}

async function main() {
  console.log("Seeding database...")

  const pwHash = await hash("password123", 12)

  // Users — one per role
  const users: Record<string, string> = {}
  const roleUsers = [
    { name: "Priya Ratnayake", email: "priya@broker.lk", role: UserRole.TeaTaster },
    { name: "Nimal Perera", email: "nimal@broker.lk", role: UserRole.TeaTaster },
    { name: "Suresh Fernando", email: "suresh@broker.lk", role: UserRole.SeniorTaster },
    { name: "Kavitha Silva", email: "kavitha@broker.lk", role: UserRole.CataloguingTeam },
    { name: "Roshan De Mel", email: "roshan@broker.lk", role: UserRole.Salesperson },
    { name: "Amara Jayawardena", email: "amara@broker.lk", role: UserRole.WarehouseStaff },
    { name: "Chandra Wickramasinghe", email: "chandra@broker.lk", role: UserRole.Finance },
    { name: "Dilmah Gunawardena", email: "dilmah@broker.lk", role: UserRole.Management },
    { name: "Admin User", email: "admin@broker.lk", role: UserRole.Admin },
  ]

  for (const u of roleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, role: u.role, passwordHash: pwHash },
    })
    users[u.role] = user.id
  }
  const tasterIds = [
    (await prisma.user.findUnique({ where: { email: "priya@broker.lk" } }))!.id,
    (await prisma.user.findUnique({ where: { email: "nimal@broker.lk" } }))!.id,
  ]
  const seniorTasterId = users[UserRole.SeniorTaster]

  console.log("Users created")

  // Sellers
  const sellerData = [
    { sellerCode: "KEN", companyName: "Kenilworth Estates Ltd", contactName: "Ajit Weerasekara", email: "ajit@kenilworth.lk" },
    { sellerCode: "DIM", companyName: "Dimbula Valley Plantations", contactName: "Harsha Bandara", email: "harsha@dimbula.lk" },
    { sellerCode: "UVA", companyName: "Uva Highlands Tea Co.", contactName: "Sanjay Peiris", email: "sanjay@uvahighlands.lk" },
    { sellerCode: "SAB", companyName: "Sabaragamuwa Select Teas", contactName: "Tharanga Nanayakkara", email: "tharanga@sabaragamuwa.lk" },
    { sellerCode: "KND", companyName: "Kandy Crown Estates", contactName: "Malith Jayasuriya", email: "malith@kandycrown.lk" },
  ]

  const sellers: Record<string, string> = {}
  for (const s of sellerData) {
    const seller = await prisma.seller.upsert({
      where: { sellerCode: s.sellerCode },
      update: {},
      create: s,
    })
    sellers[s.sellerCode] = seller.id
  }
  console.log("Sellers created")

  // Buyers
  const buyerData = [
    { buyerCode: "MJF", companyName: "MJF Teas (Pvt) Ltd", contactName: "Dilmah Team", email: "buying@mjf.lk" },
    { buyerCode: "BAT", companyName: "Batapola Trading Co.", contactName: "Ravi Kumar", email: "ravi@batapola.lk" },
    { buyerCode: "LIP", companyName: "Lipton Ceylon Ltd", contactName: "Export Desk", email: "export@lipton.lk" },
    { buyerCode: "GTL", companyName: "Global Tea Lanka", contactName: "Preethi Weerasinghe", email: "buy@gtl.lk" },
    { buyerCode: "ACE", companyName: "Ace Exporters", contactName: "Ranjith Fonseka", email: "ranjith@aceexport.lk" },
    { buyerCode: "NOR", companyName: "Nordic Tea Imports", contactName: "Lars Johansson", email: "lars@nordic.se" },
    { buyerCode: "CTC", companyName: "CTC Blenders Ltd", contactName: "Mohan Das", email: "mohan@ctcblend.lk" },
    { buyerCode: "SPE", companyName: "Specialty Teas UK", contactName: "Emily Clarke", email: "emily@specteauk.com" },
  ]

  const buyers: Record<string, string> = {}
  for (const b of buyerData) {
    const buyer = await prisma.buyer.upsert({
      where: { buyerCode: b.buyerCode },
      update: {},
      create: b,
    })
    buyers[b.buyerCode] = buyer.id
  }
  const buyerIds = Object.values(buyers)
  console.log("Buyers created")

  // Lots — 12 weeks × 8 lots = 96 lots
  const SELLER_CODE_FOR_ESTATE: Record<string, string> = {
    "Kenilworth": "KEN",
    "Dimbula Valley": "DIM",
    "Uva Highlands": "UVA",
    "Sabaragamuwa Select": "SAB",
    "Kandy Crown": "KND",
  }

  const lotIds: string[] = []
  let lotCounter = 1

  for (let week = 12; week >= 1; week--) {
    const saleDate = addDays(startOfWeek(subWeeks(new Date(), week), { weekStartsOn: 1 }), 2)
    const saleNumber = String(23 + (12 - week))
    const isCompleted = week > 2 // weeks 1-10 have auction results (week 12 = oldest, week 1 = current)

    for (let i = 0; i < 8; i++) {
      const estate = pick(ESTATES)
      // Bias: Kenilworth+BOP appears more often for comparables demo
      const grade =
        estate.name === "Kenilworth" && Math.random() > 0.4
          ? Grade.BOP
          : pick(GRADES)

      const netWeight = Math.round(randomBetween(1200, 3000) * 100) / 100
      const grossWeight = Math.round(netWeight * 1.02 * 100) / 100
      const numPackages = randomInt(24, 60)
      const lotNumber = String(4000 + lotCounter)
      const catalogueNumber = `${saleNumber}/${lotNumber}`
      const sellerCode = SELLER_CODE_FOR_ESTATE[estate.name]

      let lot
      try {
        lot = await prisma.lot.create({
          data: {
            catalogueNumber,
            saleNumber,
            lotNumber,
            saleDate,
            sellerId: sellers[sellerCode],
            estateName: estate.name,
            factory: `${estate.name} Factory`,
            region: estate.region,
            elevation: estate.elevation,
            grade,
            numPackages,
            grossWeight,
            netWeight,
            dateOfManufacture: addDays(saleDate, -14),
            warehouseLocation: `Bay ${randomInt(1, 6)}, Row ${pick(["A", "B", "C"])}, Stack ${randomInt(1, 12)}`,
            adviceNoteNumber: `AN-${saleNumber}-${lotNumber}`,
            lotStatus: isCompleted ? LotStatus.Sold : LotStatus.Active,
          },
        })
      } catch {
        // Skip duplicates
        lotCounter++
        continue
      }

      lotIds.push(lot.id)

      // Tasting record (90% of lots)
      if (Math.random() > 0.1) {
        const basePrice = BASE_PRICES[grade]
        const recPrice =
          Math.round(randomBetween(basePrice * 0.9, basePrice * 1.12) * 100) / 100
        const tastingStatus: TastingStatus =
          isCompleted ? TastingStatus.Approved : (week <= 2 ? pick(["Draft", "Submitted"]) as TastingStatus : TastingStatus.Approved)

        const tasting = await prisma.tastingRecord.create({
          data: {
            lotId: lot.id,
            tasterId: pick(tasterIds),
            dateTasted: addDays(saleDate, -7),
            dryLeafAppearanceScore: randomInt(6, 10),
            dryLeafColorScore: randomInt(5, 10),
            dryLeafUniformityScore: randomInt(6, 10),
            dryLeafAromaScore: randomInt(5, 9),
            infusionBrightnessScore: randomInt(6, 10),
            infusionColorScore: randomInt(6, 10),
            infusionEvennessScore: randomInt(5, 9),
            liquorBrightness: pick(Object.values(LiquorBrightness)),
            liquorColor: pick(["Golden", "Amber", "Coppery", "Dark Amber"]),
            liquorStrength: pick(Object.values(LiquorStrength)),
            liquorBriskness: pick(Object.values(LiquorBriskness)),
            liquorFlavor: pick(Object.values(LiquorFlavor)),
            liquorAroma: pick(Object.values(LiquorAroma)),
            overallQuality: pick(Object.values(OverallQuality)),
            priceRecommendation: recPrice,
            tastingNotes: `${estate.name} ${grade} — ${pick(["Well-made, good quality", "Bright liquor with fine aroma", "Good briskness, typical estate character", "Clean cup, good strength"])}`,
            status: tastingStatus,
            approvedById: tastingStatus === TastingStatus.Approved ? seniorTasterId : undefined,
            approvedAt: tastingStatus === TastingStatus.Approved ? addDays(saleDate, -5) : undefined,
          },
        })

        // Update lot upset price
        await prisma.lot.update({
          where: { id: lot.id },
          data: { upsettingPrice: recPrice },
        })
      }

      // Auction result (completed weeks)
      if (isCompleted) {
        const basePrice = BASE_PRICES[grade]
        const hammerPrice = Math.round(randomBetween(basePrice * 0.88, basePrice * 1.15) * 100) / 100
        const resultStatus: ResultStatus =
          Math.random() > 0.12 ? ResultStatus.Sold : (Math.random() > 0.5 ? ResultStatus.Passed : ResultStatus.Unsold)

        await prisma.auctionResult.create({
          data: {
            lotId: lot.id,
            saleNumber,
            hammerPrice: resultStatus === ResultStatus.Sold ? hammerPrice : undefined,
            buyerId: resultStatus === ResultStatus.Sold ? pick(buyerIds) : undefined,
            resultStatus,
            dateRecorded: saleDate,
          },
        })
      }

      lotCounter++
    }
    console.log(`Week ${week} done (Sale ${saleNumber})`)
  }

  console.log(`Created ${lotCounter - 1} lots`)
  console.log("\n✅ Seed complete!")
  console.log("Login credentials (all roles, password: password123):")
  for (const u of roleUsers) {
    console.log(`  ${u.role.padEnd(20)} ${u.email}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
