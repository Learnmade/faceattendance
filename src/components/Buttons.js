import { TouchableOpacity, Text, View } from 'react-native';
import { styled } from 'nativewind';

const StyledPresseable = styled(TouchableOpacity);
const StyledText = styled(Text);

export const PrimaryButton = ({ title, onPress, className, disabled, textClassName }) => (
    <StyledPresseable
        onPress={onPress}
        disabled={disabled}
        className={`bg-green-600 p-4 rounded-xl items-center active:bg-green-700 ${className} ${disabled ? 'bg-gray-600 opacity-50' : ''}`}
    >
        <StyledText className={`text-white font-bold text-lg ${textClassName}`}>{title}</StyledText>
    </StyledPresseable>
);

export const SecondaryButton = ({ title, onPress, className, disabled, textClassName }) => (
    <StyledPresseable
        onPress={onPress}
        disabled={disabled}
        className={`bg-slate-800 p-4 rounded-xl items-center active:bg-slate-700 border border-slate-700 ${className} ${disabled ? 'bg-slate-800 opacity-50' : ''}`}
    >
        <StyledText className={`text-white font-bold text-lg ${textClassName}`}>{title}</StyledText>
    </StyledPresseable>
);
