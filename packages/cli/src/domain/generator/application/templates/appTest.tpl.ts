import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";
import { PackageJSONArguments } from "./package.json.tpl";

export class AppTest implements Template {
    directory: string = './__tests__';
    filename: string = 'app.spec.ts';
    async render(context: GeneratorContext<PackageJSONArguments>): Promise<string> {

        return `
            describe('${context.packageName}', () => {
                test('sanity', () => {
                    expect()
                })
            })
        `

    }

}