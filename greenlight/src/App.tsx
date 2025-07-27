import ChartsPanel from './components/ChartsPanel';
import InputPanel from './components/InputPanel';
import { useFinanceModel } from "./hooks/useFinanceModel";

export default function App() {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };
    const { inputs, setInputs, result, loading, runModel } = useFinanceModel();
    const handleRunModel = () => {
        console.log("Inputs going to runModel:", inputs);
        runModel();
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <InputPanel
                inputs={inputs}
                handleChange={handleChange}
                runModel={handleRunModel}
                loading={loading}
            />
            {result && <ChartsPanel data={result} />}
        </div>
    );
}