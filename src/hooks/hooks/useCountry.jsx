import { useGetCountryCurrencyQuery } from "@/redux/apis/countryCurrency.api";

const useCountry = () => {
    const { data, isLoading } = useGetCountryCurrencyQuery();

    return { 
        country: data?.data?.country, 
        loading: isLoading 
    };
};

export default useCountry;

