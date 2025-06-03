const { PrismaClient } = require('../generated/prisma');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  // Seed Roles (User Roles)
  const roles = [
    'Pilot', 'Dogfighter', 'Engineer', 'Medic', 'Miner', 'Security',
    'Salvager', 'Crafter', 'Merchant', 'Hauler', 'Sniper', 'Scout',
    'Recon', 'Navigator',
  ];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Load ship data from JSON
  const shipData = JSON.parse(
    fs.readFileSync('prisma/ships.json', 'utf8')
  );

  for (const ship of shipData) {
    // Upsert ship (without roles)
    const upsertedShip = await prisma.ship.upsert({
      where: { name: ship.name },
      update: {
        manufacturer: ship.manufacturer,
        size: ship.size,
        scu: ship.scu,
      },
      create: {
        name: ship.name,
        manufacturer: ship.manufacturer,
        size: ship.size,
        scu: ship.scu,
      },
    });

    // For each role name in ship.role array
    for (const roleName of ship.role) {
      // Upsert ShipRole
      const upsertedRole = await prisma.shipRole.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });

      // Check if ShipToRole relation exists
      const existingRelation = await prisma.shipToRole.findUnique({
        where: {
          shipId_roleId: {
            shipId: upsertedShip.id,
            roleId: upsertedRole.id,
          },
        },
      });

      if (!existingRelation) {
        // Create relation between ship and shipRole
        await prisma.shipToRole.create({
          data: {
            shipId: upsertedShip.id,
            roleId: upsertedRole.id,
          },
        });
      }
    }
  }

  console.log('Seeding completed');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });