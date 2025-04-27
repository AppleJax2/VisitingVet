const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const VisitingVetProfile = require('../src/models/VisitingVetProfile');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Colorado Springs Provider data based on web search
const providerData = [
  {
    user: { 
      email: 'totalcarevetcoloradosprings@gmail.com', 
      name: 'Dr. Rivera', 
      password: 'TempPassword123!', 
      role: 'MVSProvider',
      profileImage: '/assets/images/providers/total-care-vet.jpg'
    },
    profile: {
      businessName: 'Total Care Mobile Veterinary Practice',
      contactPhone: '719-600-1999',
      contactEmail: 'totalcarevetcoloradosprings@gmail.com',
      businessAddress: '1304 N. Academy Blvd, suite 108, Colorado Springs, CO',
      businessDescription: 'We are committed to providing you and your pet with exceptional care in the comfort of your home. Going to the veterinarian\'s office is stressful, for both you and your pet. With Total Care Mobile Veterinary Practice, our services are brought to you, creating a more relaxing and enjoyable experience.',
      serviceAreaDescription: 'Colorado Springs and surrounding areas including Peyton, Falcon, Calhan, and Fountain',
      serviceAreaZipCodes: ['80907', '80909', '80910', '80915', '80916', '80917', '80918', '80919', '80920', '80921', '80922', '80923', '80924', '80925', '80926', '80927', '80928', '80929', '80930', '80831', '80808', '80911', '80817'],
      photoUrl: '/assets/images/providers/total-care-vet.jpg',
      externalSchedulingUrl: 'tel:7196001999',
      useExternalScheduling: true,
      animalTypes: ['Small Animal', 'Exotic', 'Farm Animal'],
      specialtyServices: ['Wellness Exams', 'Sick Exams', 'Vaccinations', 'Microchipping', 'Wound Repair', 'Laboratory Testing', 'Euthanasia', 'Pharmacy', 'Spay & Neuter', 'Dental Cleanings', 'Surgical Procedures', 'C-Sections', 'Day Hospitalizations'],
      bio: 'Since 2020, our team of professionals has made it their mission to provide exceptional veterinary care to all animals. It doesn\'t matter how large or small your pet is - if we can help, we will. We serve our clients with one goal in mind: to be the best mobile Veterinary Practice in Colorado Springs. From general to urgent care, Total Care Mobile Veterinary Practice aims to be your one-stop-shop for all your pet needs.',
      credentials: ['DVM'],
      yearsExperience: 5,
      licenseInfo: 'Licensed in Colorado',
      insuranceInfo: 'Fully insured',
      clinicAffiliations: ['Total Care Mobile Veterinary Practice']
    }
  },
  {
    user: { 
      email: 'info@urbantailsvet.com', 
      name: 'Dr. Alex', 
      password: 'TempPassword123!', 
      role: 'MVSProvider',
      profileImage: '/assets/images/providers/urban-tails.jpg'
    },
    profile: {
      businessName: 'Urban Tails At Home Veterinary Care',
      contactPhone: '719-287-3420',
      contactEmail: 'info@urbantailsvet.com',
      businessDescription: 'We understand how important your pets are to you, and we strive to provide the best possible care to ensure their well-being. Our team of experienced and dedicated professionals is here to offer a wide range of veterinary services tailored to meet your pet\'s specific needs.',
      serviceAreaDescription: 'Colorado Springs, El Paso County, Pueblo, Fountain, Woodland Park, Divide, Monument, Palmer Park',
      serviceAreaZipCodes: ['80907', '80909', '80910', '80915', '80916', '80917', '80918', '80919', '80920', '80921', '80922', '80923', '80924', '80925', '80926', '80927', '80928', '80929', '80930', '80831', '80808', '80911', '80817', '80132', '80133', '80814', '80816', '80819', '80829', '80904', '80905', '80906', '80907', '81001', '81003', '81004', '81005', '81006', '81007', '81008', '81009'],
      photoUrl: '/assets/images/providers/urban-tails.jpg',
      externalSchedulingUrl: 'https://www.urbantailsvet.com/appointment',
      useExternalScheduling: true,
      animalTypes: ['Small Animal'],
      specialtyServices: ['Preventive Care', 'Medical Care', 'Laser Therapy', 'At-Home Euthanasia', 'Emergency Care'],
      bio: 'Urban Tails At Home Veterinary Care provides compassionate mobile veterinarian services where we come to you. Our highly trained medical team arrives at your home with everything needed for a stress-free consultation for your furry friend.',
      credentials: ['DVM'],
      yearsExperience: 8,
      licenseInfo: 'Licensed in Colorado',
      insuranceInfo: 'Fully insured'
    }
  },
  {
    user: { 
      email: 'info@wellness-waggin.org', 
      name: 'Wellness Waggin Team', 
      password: 'TempPassword123!', 
      role: 'MVSProvider',
      profileImage: '/assets/images/providers/wellness-waggin.jpg'
    },
    profile: {
      businessName: 'Wellness Waggin\' Mobile Veterinary Clinic',
      contactPhone: '719-473-1741',
      contactEmail: 'info@wellness-waggin.org',
      businessAddress: '610 Abbot Lane, Colorado Springs, CO 80905',
      businessDescription: 'Humane Society of the Pikes Peak Region\'s Wellness Waggin\' is on the road, lending a paw to pet owners in need. The custom-built mobile veterinary clinic allows HSPPR\'s veterinary team to reach pet owners in need where they live.',
      serviceAreaDescription: 'Colorado Springs and Pueblo area',
      serviceAreaZipCodes: ['80905', '80903', '80904', '80906', '80907', '80909', '80910', '80916', '81001', '81003', '81004', '81005', '81006'],
      photoUrl: '/assets/images/providers/wellness-waggin.jpg',
      externalSchedulingUrl: 'https://www.hsppr.org/services/veterinary-services/mobile-clinic/',
      useExternalScheduling: true,
      animalTypes: ['Small Animal'],
      specialtyServices: ['Vaccinations', 'Microchipping', 'Pet Licensing', 'Low-cost Preventative Care'],
      bio: 'Many pet owners are unable to access basic veterinary care due to economic and geographic barriers. We know the human-animal bond benefits individuals, families, and the community, and to preserve this special bond, the Wellness Waggin\' hosts low-cost clinics around Colorado Springs and Pueblo.',
      credentials: ['DVM'],
      yearsExperience: 10,
      licenseInfo: 'Licensed in Colorado',
      insuranceInfo: 'Fully insured through Humane Society of the Pikes Peak Region',
      clinicAffiliations: ['Humane Society of the Pikes Peak Region']
    }
  },
  {
    user: { 
      email: 'info@clawsandpawsmobile.com', 
      name: 'Claws and Paws Team', 
      password: 'TempPassword123!', 
      role: 'MVSProvider',
      profileImage: '/assets/images/providers/claws-and-paws.jpg'
    },
    profile: {
      businessName: 'Claws and Paws Mobile, LLC',
      contactPhone: '719-555-1234', // Placeholder phone
      contactEmail: 'info@clawsandpawsmobile.com',
      businessAddress: '1670 E CHEYENNE MTN BLVD, COLORADO SPRINGS, CO 80906',
      businessDescription: 'Claws and Paws Mobile provides convenient, comprehensive veterinary care at your doorstep for dogs, cats, and other small animals.',
      serviceAreaDescription: 'Colorado Springs with focus on the Cheyenne Mountain and Broadmoor areas',
      serviceAreaZipCodes: ['80906', '80904', '80905', '80907', '80909'],
      photoUrl: '/assets/images/providers/claws-and-paws.jpg',
      externalSchedulingUrl: 'http://clawsandpawsmobile.com',
      useExternalScheduling: true,
      animalTypes: ['Small Animal'],
      specialtyServices: ['Wellness Exams', 'Vaccinations', 'Senior Pet Care', 'In-home Euthanasia'],
      bio: 'Claws and Paws Mobile provides stress-free veterinary care for your pets in the comfort of your home. Our experienced team focuses on creating a calm environment for your pet\'s healthcare needs.',
      credentials: ['DVM'],
      yearsExperience: 5,
      licenseInfo: 'Licensed in Colorado',
      insuranceInfo: 'Fully insured'
    }
  }
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
          profile = await VisitingVetProfile.create(profilePayload);
          console.log(`Profile created for user: ${user.email}`);
          profilesCreated++;
        } else {
          console.log(`Profile already exists for user: ${user.email}`);
          // Optional: Update existing profile
          await VisitingVetProfile.findOneAndUpdate(
            { user: user._id },
            { ...item.profile },
            { new: true }
          );
          console.log(`Profile updated for user: ${user.email}`);
          profilesCreated++;
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

// Script execution
const runScript = async () => {
  await connectDB();
  await importData();
};

runScript(); 