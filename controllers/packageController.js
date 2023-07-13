const Package = require("../models/Packages");


// Create a new package
exports.createPackage = (req, res) => {
  const packageData = req.body;

  console.log(packageData)

  Package.create(packageData)
    .then((createdPackage) => {
      res.status(201).json({message:'package created sucessfully',createdPackage});
    })
    .catch((error) => {
      res.status(400).json({ message: 'Failed to create package', error });
    });
};

// Get all packages
exports.getAllPackages = (req, res) => {
  Package.find()
    .then((packages) => {
      res.status(200).json({packages:packages});
    })
    .catch((error) => {
      res.status(400).json({ message: 'Failed to retrieve packages', error });
    });
};

// Get a single package by ID
exports.getPackageById = (req, res) => {
  const packageId = req.params.id;

  Package.findById(packageId)
    .then((package) => {
      if (!package) {
        return res.status(404).json({ message: 'Package not found' });
      }
      res.status(200).json(package);
    })
    .catch((error) => {
      res.status(400).json({ message: 'Failed to retrieve package', error });
    });
};

// Update a package by ID
exports.updatePackageById = (req, res) => {
  const packageId = req.params.id;
  const packageData = req.body;

  Package.findByIdAndUpdate(packageId, packageData, { new: true })
    .then((updatedPackage) => {
      if (!updatedPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      res.status(200).json(updatedPackage);
    })
    .catch((error) => {
      res.status(400).json({ message: 'Failed to update package', error });
    });
};

// Delete a package by ID
exports.deletePackageById = (req, res) => {
  const packageId = req.params.id;

  Package.findByIdAndRemove(packageId)
    .then((deletedPackage) => {
      if (!deletedPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      res.status(200).json({ message: 'Package deleted successfully' });
    })
    .catch((error) => {
      res.status(400).json({ message: 'Failed to delete package', error });
    });
};
