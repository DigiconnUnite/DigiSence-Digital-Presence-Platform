// CSV Parser Utility
export interface CSVRow {
  [key: string]: string;
}

export interface ParseResult {
  data: CSVRow[];
  errors: ParseError[];
  meta: {
    fields: string[];
    rowCount: number;
  };
}

export interface ParseError {
  row: number;
  field?: string;
  message: string;
}

// Parse CSV string to array of objects
export const parseCSV = (csvText: string): ParseResult => {
  const errors: ParseError[] = [];
  const lines = csvText.trim().split('\n');
  const rowCount = lines.length;

  if (rowCount === 0) {
    return {
      data: [],
      errors: [{ row: 0, message: 'Empty CSV file' }],
      meta: { fields: [], rowCount: 0 },
    };
  }

  // Parse header line
  const headerLine = lines[0];
  const fields = parseCSVLine(headerLine).map((field) =>
    field.trim().toLowerCase().replace(/\s+/g, '_')
  );

  // Validate required fields
  const requiredFields = ['name', 'email', 'admin_name'];
  const missingRequired = requiredFields.filter((f) => !fields.includes(f));

  if (missingRequired.length > 0) {
    return {
      data: [],
      errors: [
        {
          row: 0,
          message: `Missing required fields: ${missingRequired.join(', ')}`,
        },
      ],
      meta: { fields, rowCount: 0 },
    };
  }

  const data: CSVRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length !== fields.length) {
      errors.push({
        row: i + 1,
        message: `Expected ${fields.length} columns, got ${values.length}`,
      });
      continue;
    }

    const row: CSVRow = {};
    fields.forEach((field, index) => {
      row[field] = values[index].trim();
    });

    // Validate row
    const rowErrors = validateRow(row, i + 1);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    data.push(row);
  }

  return {
    data,
    errors,
    meta: { fields, rowCount: data.length },
  };
};

// Parse a single CSV line (handles quoted fields)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

// Validate a single row
const validateRow = (row: CSVRow, rowNumber: number): ParseError[] => {
  const errors: ParseError[] = [];

  // Validate email
  if (!isValidEmail(row.email)) {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: `Invalid email format: ${row.email}`,
    });
  }

  // Validate phone (optional)
  if (row.phone && !isValidPhone(row.phone)) {
    errors.push({
      row: rowNumber,
      field: 'phone',
      message: `Invalid phone format: ${row.phone}`,
    });
  }

  // Validate website (optional)
  if (row.website && !isValidUrl(row.website)) {
    errors.push({
      row: rowNumber,
      field: 'website',
      message: `Invalid website URL: ${row.website}`,
    });
  }

  // Validate name length
  if (row.name.length < 2 || row.name.length > 100) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Name must be between 2 and 100 characters',
    });
  }

  // Validate admin name length
  if (row.admin_name.length < 2 || row.admin_name.length > 100) {
    errors.push({
      row: rowNumber,
      field: 'admin_name',
      message: 'Admin name must be between 2 and 100 characters',
    });
  }

  return errors;
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

// URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Convert data to CSV
export const toCSV = (data: Record<string, any>[], fields: string[]): string => {
  const header = fields.map((f) => `"${f}"`).join(',');
  const rows = data.map((row) =>
    fields.map((f) => {
      const value = row[f]?.toString() || '';
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...rows].join('\n');
};

// Download CSV file
export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate sample CSV template
export const generateCSVTemplate = (): string => {
  return `name,email,admin_name,description,phone,website,address,category
"Acme Corporation","admin@acme.com","John Smith","A leading technology company","+1 555-123-4567","https://acme.com","123 Main St, New York, NY","Technology
"Global Services","admin@globalservices.com","Jane Doe","Providing global business solutions","+1 555-987-6543","https://globalservices.com","456 Oak Ave, Los Angeles, CA","Consulting`;
};

// Map CSV fields to API fields
export const mapCSVToBusinessData = (row: CSVRow): {
  name: string;
  email: string;
  adminName: string;
  description?: string;
  phone?: string;
  website?: string;
  address?: string;
  categoryId?: string;
  password?: string;
} => {
  return {
    name: row.name,
    email: row.email,
    adminName: row.admin_name,
    description: row.description || undefined,
    phone: row.phone || undefined,
    website: row.website || undefined,
    address: row.address || undefined,
    categoryId: row.category_id || undefined,
  };
};

// Validate category names from CSV
export const validateCategories = async (
  categories: { name: string; id: string }[],
  csvCategories: string[]
): Promise<{ valid: string[]; invalid: string[] }> => {
  const valid: string[] = [];
  const invalid: string[] = [];

  const categoryMap = new Map(
    categories.map((c) => [c.name.toLowerCase(), c.id])
  );

  csvCategories.forEach((cat) => {
    if (categoryMap.has(cat.toLowerCase())) {
      valid.push(cat);
    } else {
      invalid.push(cat);
    }
  });

  return { valid, invalid };
};
