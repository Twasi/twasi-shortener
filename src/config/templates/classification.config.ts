export type ClassificationConfig = {
    autoClassify: {
        positive: {
            percentage: number;
            minClassified: number;
        },
        negative: {
            percentage: number;
            minClassified: number;
        }
    }
}

export const DefaultClassificationConfig: ClassificationConfig = {
    autoClassify: {
        negative: {
            minClassified: 3,
            percentage: .75
        },
        positive: {
            minClassified: 8,
            percentage: .9
        }
    }
}
