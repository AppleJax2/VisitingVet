const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User'); // Adjust path if needed
const VisitingVetProfile = require('../models/VisitingVetProfile'); // Adjust path if needed

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../config/config.env') }); // Adjust path to your .env file

// Provider data scraped earlier (condensed for brevity)
const providerData = [
  {
    user: { email: 'contact@thevets.com', name: 'The Vets - Denver', password: 'TempPassword123!', role: 'MVSProvider' },
    profile: {
      businessName: 'The Vets - Mobile Vet Care in Denver',
      contactPhone: '844-722-8387',
      contactEmail: 'contact@thevets.com', // Use a placeholder if only form exists
      businessDescription: 'The Vets sets a new standard of personalized mobile veterinarian care in Denver for cats & dogs. They provide comprehensive in-home care including wellness exams, sick visits, vaccinations, microchipping, home lab tests, ultrasound, dermatology, litter exams, and nutrition advice.',
      serviceAreaDescription: 'Services the Denver, CO metropolitan area including multiple surrounding suburbs',
      serviceAreaZipCodes: ['80022', '80023', '80030', '80031', '80216', '80221', '80229', '80233', '80234', '80241', '80260', '80516', '80601', '80602', '80603', '80640', '80002', '80003', '80004', '80020', '80021', '80026', '80027', '80033', '80202', '80203', '80204', '80211', '80212', '80214', '80215', '80218', '80301', '80303', '80016', '80104', '80107', '80108', '80109', '80112', '80116', '80120', '80122', '80123', '80124', '80125', '80126', '80128', '80129', '80130', '80134', '80138', '80264', '80010', '80011', '80012', '80013', '80014', '80015', '80017', '80018', '80045', '80110', '80111', '80113', '80121', '80205', '80206', '80207', '80209', '80210', '80219', '80220', '80222', '80223', '80224', '80226', '80227', '80228', '80230', '80231', '80232', '80235', '80236', '80237', '80238', '80239', '80246', '80247', '80266'], // Truncated, add all if available
      photoUrl: 'https://thevets.com/wp-content/themes/thevets/img/logo-white.svg', // Example URL
      externalSchedulingUrl: 'https://booking.thevets.com/',
      useExternalScheduling: true,
      animalTypes: ['Small Animal'],
      specialtyServices: ['Sick visits', 'Wellness exams', 'Vaccinations', 'Microchipping', 'Home lab tests', 'Ultrasound', 'Dermatology'],
      bio: 'The Vets provides professional mobile veterinary services in the comfort of your home. Their veterinarians are experienced professionals dedicated to providing stress-free care for pets.',
      credentials: ['DVM'],
      yearsExperience: 5, // Assuming 5+ means at least 5
      licenseInfo: 'Licensed in Colorado', // Placeholder
      insuranceInfo: 'Fully insured', // Placeholder
      clinicAffiliations: ['BetterVet']
    }
  },
  {
    user: { email: 'info@chicagoinhomevet.net', name: 'Chicago In Home Veterinary Care', password: 'TempPassword123!', role: 'MVSProvider' },
    profile: {
        businessName: 'Chicago in Home Veterinary Care',
        contactPhone: '312-780-9310',
        contactEmail: 'info@chicagoinhomevet.net', // Placeholder if form only
        businessAddress: '564 W Randolph St, 2nd floor, Chicago, IL 60661',
        businessDescription: 'Full service concierge veterinary service welcoming both illness cases and pet patients in need of routine medical care. Dr. Dawn Straily provides comprehensive care for dogs and cats in the comfort of your home.',
        serviceAreaDescription: 'Chicago, IL metropolitan area',
        serviceAreaZipCodes: [], // Add specific ZIPs if known
        photoUrl: 'https://www.chicagoinhomevet.net/images/logo/logo.png', // Example URL
        externalSchedulingUrl: 'https://www.chicagoinhomevet.net/appointment',
        useExternalScheduling: true, 
        animalTypes: ['Small Animal'],
        specialtyServices: ['Bloodwork', 'Illness Diagnosis And Treatment', 'Vaccinations', 'New Puppy Care', 'Wellness Care'],
        bio: 'Dr. Dawn Straily is a licensed IL veterinarian treating all sizes of dogs and cats. She has years of experience treating serious conditions and offering regular pet wellness care.',
        credentials: ['DVM'], // Assuming DVM
        licenseInfo: 'Licensed in Illinois', // Placeholder
        insuranceInfo: 'Fully insured' // Placeholder
    }
  },
   {
    user: { email: 'info@urbananimalcare.com', name: 'Urban Animal Care', password: 'TempPassword123!', role: 'MVSProvider' },
    profile: {
        businessName: 'Urban Animal Care',
        contactEmail: 'info@urbananimalcare.com',
        businessDescription: 'Compassionate mobile veterinarian care for the Chicagoland community. Providing in-home appointments, labs & diagnostics, and animal husbandry services.',
        serviceAreaDescription: 'Chicagoland area',
        photoUrl: 'https://urbananimalcare.com/wp-content/uploads/2021/12/Mobile-Veterinarian-in-Chicago-Ellen-Boyd-DVM-PhD-Urban-Animal-Care-4.jpg', // Example URL
        externalSchedulingUrl: 'mailto:info@urbananimalcare.com',
        useExternalScheduling: true,
        animalTypes: ['Small Animal', 'Avian'],
        specialtyServices: ['In-Home Veterinary Appointments', 'Labs & Diagnostics', 'Animal Husbandry'],
        bio: 'Urban Animal Care was born out of necessity for quality care for animals, community and future. Dr. Boyd focuses on practicing compassionate care for the whole animal and strives to serve the needs of the families in the diverse community.',
        credentials: ['DVM', 'PhD'],
        licenseInfo: 'Licensed in Illinois', // Placeholder
        insuranceInfo: 'Fully insured' // Placeholder
    }
  },
  {
    user: { email: 'mobilevet@ymail.com', name: 'St Louis MobileVet', password: 'TempPassword123!', role: 'MVSProvider' },
    profile: {
        businessName: 'St Louis MobileVet',
        contactPhone: '314-566-6545',
        contactEmail: 'Mobilevet@ymail.com',
        businessDescription: 'Full-service mobile veterinary clinic serving St. Louis county, St. Charles county, and surrounding areas. Dr. Jaime Plappert Waltman and Dr. Brad Waltman provide at-home-patient care.',
        serviceAreaDescription: 'St. Louis county, St. Charles county, and surrounding areas',
        photoUrl: 'https://nebula.wsimg.com/5b5579e705236610b555a0729ff534d9?AccessKeyId=860A5D3FDB5F8C79E81F&disposition=0&alloworigin=1', // Example URL
        externalSchedulingUrl: 'tel:3145666545', // Using tel: link as scheduling URL
        useExternalScheduling: true,
        animalTypes: ['Small Animal'],
        specialtyServices: ['Wellness Health Care Examinations', 'Kitten and Puppy Health Care', 'Senior Pet Health Care', 'Personalized Vaccination Programs', 'Dermatology', 'Orthopedic Exams', 'Neurologic Evaluations', 'Weight Management Counseling', 'On-site fecal examinations', 'Laser Therapy Treatments', 'Hospice Care', 'Home Euthanasia'],
        bio: 'St. Louis MobileVet provides comprehensive veterinary care in the comfort of your home, reducing stress for your pet and adding convenience for you.',
        credentials: ['DVM'], // Assuming DVM for both
        licenseInfo: 'Licensed in Missouri', // Placeholder
        insuranceInfo: 'Fully insured' // Placeholder
    }
  }
  // Add other providers (Mile High, Mobile Vet Service (St. Louis), Metro-East) here following the same structure
];

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Import data
const importData = async () => {
  try {
    // Clear existing profiles/users if needed (Use with caution!)
    // await User.deleteMany({ role: 'MVSProvider' });
    // await VisitingVetProfile.deleteMany({});
    // console.log('Existing provider data cleared...');

    let usersCreated = 0;
    let profilesCreated = 0;

    for (const item of providerData) {
        try {
            // Check if user exists
            let user = await User.findOne({ email: item.user.email });
            if (!user) {
                // Create User
                user = await User.create(item.user);
                console.log(`User created: ${user.email}`);
                usersCreated++;
            } else {
                console.log(`User already exists: ${user.email}`);
            }

            // Check if profile exists for this user
            let profile = await VisitingVetProfile.findOne({ user: user._id });
            if (!profile) {
                // Create Profile, linking to the user
                const profilePayload = { ...item.profile, user: user._id };
                await VisitingVetProfile.create(profilePayload);
                console.log(`Profile created for user: ${user.email}`);
                profilesCreated++;
            } else {
                 console.log(`Profile already exists for user: ${user.email}`);
                 // Optional: Update existing profile if needed
                 // await VisitingVetProfile.updateOne({ user: user._id }, item.profile);
            }

        } catch (userOrProfileError) {
             console.error(`Error processing item for email ${item.user.email}:`, userOrProfileError.message);
             // Continue with the next item
        }
    }

    console.log(`--------------------`);
    console.log(`Data Import Summary:`);
    console.log(`Users Created: ${usersCreated}`);
    console.log(`Profiles Created/Updated: ${profilesCreated}`);
    console.log(`Data Successfully Imported!`);
    process.exit();
  } catch (error) {
    console.error('Error during data import process:', error);
    process.exit(1);
  }
};

// Destroy data (Optional function to clear)
const destroyData = async () => {
  try {
    await User.deleteMany({ role: 'MVSProvider' });
    await VisitingVetProfile.deleteMany({});
    console.log('Provider Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

// Script execution logic
const runScript = async () => {
    await connectDB();

    if (process.argv[2] === '-d') {
        // await destroyData(); // Uncomment with extreme caution
        console.log('Destroy function commented out for safety. Uncomment in script to enable.');
        process.exit();
    } else {
        await importData();
    }
}

runScript(); 