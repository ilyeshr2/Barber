const { sequelize } = require('./models');
const { QueryTypes } = require('sequelize');

async function testSocialLinks() {
  try {
    console.log('Checking social links in database...');

    // Get all salon data
    const salon = await sequelize.query(
      'SELECT * FROM "Salon" LIMIT 1',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Salon record found:');
    console.log(JSON.stringify(salon[0], null, 2));
    
    // Get social links
    const socialLinks = await sequelize.query(
      'SELECT * FROM "SocialLinks" WHERE salon_id = :salonId',
      {
        replacements: { salonId: salon[0].id },
        type: QueryTypes.SELECT
      }
    );
    
    console.log(`\nFound ${socialLinks.length} social links:`);
    for (const link of socialLinks) {
      console.log(`- ${link.platform}: ${link.url} (ID: ${link.id})`);
    }
    
    // Try to update a social link directly
    const platform = 'instagram';
    const newUrl = 'https://www.instagram.com/yaniso_barber';
    
    const updateResult = await sequelize.query(
      'UPDATE "SocialLinks" SET url = :url, updated_at = NOW() WHERE salon_id = :salonId AND platform = :platform',
      {
        replacements: { 
          url: newUrl,
          salonId: salon[0].id,
          platform
        },
        type: QueryTypes.UPDATE
      }
    );
    
    console.log(`\nDirect update result for ${platform}:`, updateResult);
    
    // Check if it was updated
    const updatedLinks = await sequelize.query(
      'SELECT * FROM "SocialLinks" WHERE salon_id = :salonId AND platform = :platform',
      {
        replacements: { 
          salonId: salon[0].id,
          platform
        },
        type: QueryTypes.SELECT
      }
    );
    
    console.log(`\nAfter update, ${platform} link is now:`, updatedLinks[0].url);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed');
  }
}

testSocialLinks(); 