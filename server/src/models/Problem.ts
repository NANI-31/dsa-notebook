import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: mongoose.Types.ObjectId;
  subCategory: string;
  categories: string[];
  starred: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  techniques: mongoose.Types.ObjectId[];
  description: string;
  explanation: string;
  notes: string;
  addedDate: Date;
}

const ProblemSchema = new Schema<IProblem>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String, required: true },
  categories: [{ type: String }],
  starred: { type: Boolean, default: false },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  techniques: [{ type: Schema.Types.ObjectId, ref: 'Technique' }],
  description: { type: String, default: '' },
  explanation: { type: String, default: '' },
  notes: { type: String, default: '' },
  addedDate: { type: Date, default: Date.now }
});

// Auto-generate slug from title if not provided
ProblemSchema.pre('validate', async function() {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w-]+/g, '')  // Remove all non-word chars
      .replace(/--+/g, '-');    // Replace multiple - with single -
  }
});

// Validation middleware to ensure subCategory exists in the Category collection
ProblemSchema.pre("save", async function () {
  if (this.isModified("category") || this.isModified("subCategory")) {
    // Use mongoose.model to avoid potential circular dependency issues
    const Category = mongoose.model("Category");
    const categoryDoc = await Category.findById(this.category);

    if (!categoryDoc) {
      throw new Error(
        `Validation Error: Category ID "${this.category}" does not exist in the taxonomy.`,
      );
    }

    // @ts-ignore - access subCategories from the dynamically loaded model
    if (!categoryDoc.subCategories.includes(this.subCategory)) {
      throw new Error(
        `Validation Error: Sub-category "${this.subCategory}" is not a valid child of "${categoryDoc.name}".`,
      );
    }
  }
});

// Add text index for advanced search
ProblemSchema.index(
  {
    title: "text",
    description: "text",
    explanation: "text",
    notes: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      explanation: 2,
      notes: 1,
    },
    name: "ProblemTextIndex",
  },
);

export default mongoose.model<IProblem>('Problem', ProblemSchema);
