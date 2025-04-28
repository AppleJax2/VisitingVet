const Setting = require('../models/Setting');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all editable application settings
 * @route   GET /api/v1/settings
 * @access  Private (Admin)
 */
exports.getSettings = asyncHandler(async (req, res, next) => {
    // Fetch only settings marked as editable by the UI
    const settings = await Setting.find({ isEditable: true }).sort('category key');

    // Optionally transform into a key-value object for easier frontend use
    // const settingsMap = settings.reduce((acc, setting) => {
    //     acc[setting.key] = setting.value;
    //     return acc;
    // }, {});

    res.status(200).json({
        success: true,
        count: settings.length,
        data: settings // Return the full setting objects for more context in UI
    });
});

/**
 * @desc    Update a single application setting by its key
 * @route   PUT /api/v1/settings/:key
 * @access  Private (Admin)
 */
exports.updateSetting = asyncHandler(async (req, res, next) => {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
         return next(new ErrorResponse('Setting value is required', 400));
    }

    const setting = await Setting.findOne({ key: key });

    if (!setting) {
        return next(new ErrorResponse(`Setting with key '${key}' not found`, 404));
    }

    if (!setting.isEditable) {
        return next(new ErrorResponse(`Setting '${key}' cannot be edited`, 403));
    }

    // Basic type validation/coercion based on schema
    let coercedValue = value;
    try {
        switch (setting.type) {
            case 'number':
                coercedValue = Number(value);
                if (isNaN(coercedValue)) throw new Error();
                break;
            case 'boolean':
                // Handle strings 'true'/'false' or actual booleans
                if (typeof value === 'string') {
                     coercedValue = value.toLowerCase() === 'true';
                } else {
                    coercedValue = Boolean(value);
                }
                break;
             case 'array':
                if (!Array.isArray(value)) {
                     // Attempt to parse if it looks like a JSON array string
                     if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                         coercedValue = JSON.parse(value);
                         if (!Array.isArray(coercedValue)) throw new Error();
                     } else {
                        throw new Error();
                     }
                } // else keep as array
                break;
            case 'json':
                 if (typeof value !== 'object' || Array.isArray(value)) {
                     // Attempt to parse if it looks like a JSON object string
                      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                         coercedValue = JSON.parse(value);
                          if (typeof coercedValue !== 'object' || Array.isArray(coercedValue)) throw new Error();
                     } else {
                         throw new Error();
                     }
                 } // else keep as object
                 break;
            case 'string':
            default:
                coercedValue = String(value);
                break;
        }
    } catch (e) {
         return next(new ErrorResponse(`Invalid value format for setting type '${setting.type}'`, 400));
    }

    setting.value = coercedValue;
    await setting.save();

    res.status(200).json({
        success: true,
        data: setting
    });
});

// Optional: Add endpoint to get a single setting value (e.g., for use by other services)
// exports.getSettingByKey = asyncHandler(async (req, res, next) => { ... }); 