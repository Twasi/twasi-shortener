import {DBShortenedUrl} from "../../models/urls/shortened-url.model";
import {redirectionToSameHostQuery} from "../urls/helpers/find-same-host.routine";
import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";
import {ClassificationConfig} from "../../config/app-config";

export const autoClassify = async (url: DBShortenedUrl): Promise<boolean | null> => {
    const query = [{
        // Match the same host
        $match: {
            ...redirectionToSameHostQuery(url.redirection),
            classification: {
                $exists: true
            }
        }
    }, {
        // Count total amount and "true" classifications
        $group: {
            _id: null,
            amount: {
                $sum: 1
            },
            classification: {
                $sum: {
                    $cond: ["$classification", 1, 0]
                }
            }
        }
    }, {
        // Calculate average classification
        $project: {
            amount: "$amount",
            classification: {
                $divide: ["$classification", "$amount"]
            }
        }
    }];
    const result: { amount: number, classification: number }[] = await DBShortenedUrlModel.aggregate(query);
    if (!result.length) return null;

    let classification: boolean | null = null;

    const {positive, negative} = ClassificationConfig.autoClassify;
    if (result[0].classification >= positive.percentage && result[0].amount >= positive.minClassified) classification = true;
    else if ((1 - result[0].classification) >= negative.percentage && result[0].amount >= negative.minClassified) classification = false;

    console.log(`[Auto-Classification] Done for url '${new URL(url.redirection).hostname}/...':`);
    console.log(`${result[0].classification * 100}% of ${result[0].amount} urls on this host are nice.`);
    console.log(
        classification === null ? "This are not enough results for auto-classification." :
            classification ? "Classified redirection as nice." :
                "Classified redirection as likely bad or inappropriate."
    );

    return classification;
}
